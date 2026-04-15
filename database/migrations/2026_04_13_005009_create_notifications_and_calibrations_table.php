<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * TABLA: notifications
 * ─────────────────────────────────────────────────────────────────────────
 * Propósito:
 *   Sistema de notificaciones in-app para el usuario. Laravel incluye
 *   este sistema de forma nativa — esta migración sigue exactamente
 *   el esquema estándar que genera `php artisan notifications:table`.
 *
 *   Cada vez que se dispara una alerta, se crea una notificación para
 *   el dueño del dispositivo (y los viewers, si se configura).
 *
 * Relaciones:
 *   - belongsTo → users   (destinatario de la notificación)
 *
 * Cómo funciona en Laravel:
 *   - El modelo User implementa el trait Notifiable.
 *   - Se crean clases Notification (app/Notifications/) que definen
 *     el contenido para distintos canales: database, mail, slack, etc.
 *   - Al llamar $user->notify(new AlertTriggeredNotification($alert)),
 *     Laravel inserta automáticamente en esta tabla.
 *
 * Columnas clave:
 *   - type: nombre completo de la clase PHP (ej: "App\Notifications\AlertTriggered")
 *   - data: JSON flexible con el contenido de la notificación. Puede incluir
 *     el mensaje, el device_id, el alert_id, la URL de acción, etc.
 *   - read_at: NULL = no leída | timestamp = leída. Permite el badge
 *     de "notificaciones sin leer" en la Navbar.
 *
 * Notas de diseño:
 *   - El id es UUID (string), no bigint. Así lo genera Laravel por defecto
 *     para evitar colisiones en sistemas distribuidos.
 * ─────────────────────────────────────────────────────────────────────────
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── Tabla de notificaciones (estándar Laravel) ──────────────────
        Schema::create('notifications', function (Blueprint $table) {
            // UUID en lugar de auto-increment (estándar de Laravel Notifications)
            $table->uuid('id')->primary();

            // Nombre completo de la clase PHP que generó la notificación
            $table->string('type');

            // Tipo polimórfico: quién recibe la notificación
            // notifiable_type = "App\Models\User", notifiable_id = user.id
            $table->morphs('notifiable');

            // Contenido flexible en JSON
            // Ej: { "alert_id": 5, "message": "pH bajo: 5.2", "device": "Acuario A" }
            $table->json('data');

            // NULL = sin leer | timestamp = cuándo se marcó como leída
            $table->timestamp('read_at')->nullable();

            $table->timestamps();

            // Índice para el badge de "X notificaciones sin leer"
            $table->index(['notifiable_type', 'notifiable_id', 'read_at']);
        });

        // ── Tabla de calibraciones históricas ──────────────────────────
        /**
         * TABLA: device_sensor_calibrations
         * ─────────────────────────────────────────────────────────────────
         * Propósito:
         *   Historial de cambios en los parámetros de calibración de cada
         *   sensor. Cuando un técnico ajusta el offset o factor de un sensor,
         *   se guarda el valor anterior para trazabilidad completa.
         *
         *   Permite responder: "¿Por qué los datos del 15 de marzo son
         *   diferentes? → Porque ese día se recalibró el sensor."
         *
         *   También permite recalcular datos históricos si se detecta que
         *   la calibración anterior era incorrecta.
         *
         * Relaciones:
         *   - belongsTo → device_sensors   (qué sensor fue calibrado)
         *
         * Cuándo se inserta un registro:
         *   En el Observer del modelo DeviceSensor, al detectar que
         *   calibration_offset o calibration_factor cambiaron:
         *
         *   class DeviceSensorObserver {
         *       public function updating(DeviceSensor $sensor): void {
         *           if ($sensor->isDirty(['calibration_offset', 'calibration_factor'])) {
         *               DeviceSensorCalibration::create([...]);
         *           }
         *       }
         *   }
         * ─────────────────────────────────────────────────────────────────
         */
        Schema::create('device_sensor_calibrations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('device_sensor_id')
                  ->constrained('device_sensors')
                  ->cascadeOnDelete();

            // Snapshot del offset ANTERIOR a este cambio
            $table->decimal('old_offset', 8, 4);
            // Nuevo offset aplicado
            $table->decimal('new_offset', 8, 4);

            // Notas del técnico sobre por qué se recalibró
            $table->text('notes')->nullable(); // Ej: "Sensor limpiado, deriva corregida"

            $table->timestamps();

            $table->index(['device_sensor_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_sensor_calibrations');
        Schema::dropIfExists('notifications');
    }
};
