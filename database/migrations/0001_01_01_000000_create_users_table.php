<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: users
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Almacena las cuentas de usuario del sistema. Es la entidad raíz de
 *   toda la jerarquía: un usuario posee acuarios, que contienen dispositivos,
 *   que generan telemetría. Laravel usa esta tabla también para Sanctum
 *   (autenticación API) y el sistema de notificaciones.
 *
 * Relaciones que parten de aquí:
 *   - hasMany  → aquariums             (un usuario tiene muchos acuarios)
 *   - hasMany  → user_devices          (acceso a dispositivos compartidos)
 *   - hasMany  → notifications         (avisos del sistema)
 *
 * Notas de diseño:
 *   - email_verified_at: permite el flujo de verificación de correo de Laravel.
 *   - remember_token: usado por el sistema de "recordarme" de las sesiones web.
 *   - La columna password será hasheada automáticamente en el modelo.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            // Clave primaria autoincremental sin signo (soporta ~18 mil millones de registros)
            $table->id();

            $table->string('name');

            // unique() crea un índice UNIQUE automáticamente — búsquedas O(log n)
            $table->string('email')->unique();

            $table->timestamp('email_verified_at')->nullable();

            // Nunca almacenar contraseñas en texto plano — Laravel usa bcrypt/argon2 por defecto
            $table->string('password');

            // Token para la funcionalidad "Recordarme" — nullable porque no siempre se usa
            $table->rememberToken();

            // created_at y updated_at — gestionados automáticamente por Eloquent
            $table->timestamps();
        });

        // Tabla de tokens de restablecimiento de contraseña (requerida por Laravel Auth)
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Tabla de sesiones (si usas driver 'database' en config/session.php)
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
