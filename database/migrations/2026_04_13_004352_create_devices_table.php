<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: devices
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Representa las unidades físicas de procesamiento (nodos) desplegadas
 *   en la red — principalmente microcontroladores ESP32. Cada registro
 *   es un dispositivo real con una dirección MAC única en el mundo.
 *
 *   Es el "pasaporte" del hardware: contiene sus credenciales de red,
 *   su estado operativo actual y su versión de firmware.
 *
 * Relaciones:
 *   - belongsTo → aquariums        (instalado en qué acuario)
 *   - hasMany   → device_sensors   (sensores conectados a este nodo)
 *   - hasMany   → user_devices     (usuarios con acceso a este dispositivo)
 *
 * Autenticación del dispositivo:
 *   El ESP32 no usa usuario/contraseña — se autentica con api_key en cada
 *   request HTTP. La key se genera en el servidor al registrar el dispositivo
 *   y se almacena HASHEADA (sha256). El ESP32 guarda la key en texto plano
 *   en su memoria flash (EEPROM/Preferences).
 *
 * Notas de diseño:
 *   - mac_address: único a nivel mundial — sirve para identificar el
 *     dispositivo si se pierde la api_key o se resetea.
 *   - api_key: se guarda el hash, nunca el valor original. El middleware
 *     DeviceApiKeyMiddleware recibe la key cruda, la hashea y compara.
 *   - last_seen_at: actualizado en cada request exitoso. Permite detectar
 *     dispositivos offline (no han reportado en X minutos).
 *   - firmware_version: útil para mostrar alertas de actualización en la UI.
 *   - status ENUM: limita los valores posibles a nivel de base de datos,
 *     evitando strings inválidos como "on" o "activo".
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();

            // FK al acuario donde está instalado físicamente
            $table->foreignId('aquarium_id')
                ->constrained('aquariums')
                ->cascadeOnDelete();

            $table->string('name'); // Nombre descriptivo: "Nodo Acuario Norte"

            // Identificador de red único a nivel mundial
            // Formato: "AA:BB:CC:DD:EE:FF" — 17 caracteres
            $table->string('mac_address', 17)->unique();

            // IP actual del dispositivo en la red local (puede cambiar con DHCP)
            $table->string('ip_address', 45)->nullable(); // 45 chars soporta IPv6

            $table->string('firmware_version')->nullable(); // Ej: "1.2.4"

            // Hash SHA-256 de la API key real (64 caracteres hex)
            // El dispositivo guarda la key original; aquí solo el hash
            $table->string('api_key', 64)->unique();

            // ENUM evita valores arbitrarios — solo estos 3 estados son válidos
            $table->enum('status', ['online', 'offline', 'maintenance'])
                ->default('offline');

            // Última vez que el dispositivo envió datos exitosamente
            // NULL = nunca se ha conectado
            $table->timestamp('last_seen_at')->nullable();

            $table->timestamps();

            // Índice para la query más frecuente: "todos los dispositivos de este acuario"
            $table->index('aquarium_id');

            // Índice para el job que detecta dispositivos offline:
            // "devices WHERE status = 'online' AND last_seen_at < ahora - 5min"
            $table->index(['status', 'last_seen_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
