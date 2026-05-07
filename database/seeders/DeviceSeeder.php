<?php

namespace Database\Seeders;

use App\Models\Device;
use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Database\Seeder;

class DeviceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@aqua.test')->firstOrFail();

        $devices = [

            [
                'aquarium_id' => 1,
                'name' => 'ESP32 Nodo Alpha',
                'mac_address' => 'AA:BB:CC:DD:EE:01',
                'firmware_version' => '2.1.0',
                'status' => 'online',
            ],

            [
                'aquarium_id' => 2,
                'name' => 'ESP32 Nodo Beta',
                'mac_address' => 'AA:BB:CC:DD:EE:02',
                'firmware_version' => '2.0.5',
                'status' => 'offline',
            ],

            [
                'aquarium_id' => null,
                'name' => 'ESP32 Nodo Gamma',
                'mac_address' => 'AA:BB:CC:DD:EE:03',
                'firmware_version' => '2.1.3',
                'status' => 'unpaired',
            ],

            [
                'aquarium_id' => null,
                'name' => 'ESP32 Nodo Demo',
                'mac_address' => 'AA:BB:CC:DD:EE:04',
                'firmware_version' => '2.1.4',
                'status' => 'unpaired',
            ],

        ];

        foreach ($devices as $data) {

            if (Device::where('mac_address', $data['mac_address'])->exists()) {
                continue;
            }

            $plainKey = bin2hex(random_bytes(32));
            $hashedKey = hash('sha256', $plainKey);

            $this->command->info("- Plain del dispositivo: {$data['mac_address']} → {$plainKey}");

            $device = Device::create([
                'aquarium_id' => $data['aquarium_id'],
                'name' => $data['name'],
                'mac_address' => $data['mac_address'],
                'firmware_version' => $data['firmware_version'],
                'api_key' => $hashedKey,
                'status' => $data['status'],
                'last_seen_at' => $data['status'] === 'online'
                    ? now()
                    : now()->subHours(2),
            ]);

            if ($data['status'] !== 'unpaired') {

                UserDevice::create([
                    'user_id' => $admin->id,
                    'device_id' => $device->id,
                    'role' => 'owner',
                ]);
            }

            $this->command->info("✓ Dispositivo: {$device->name}");
            $this->command->warn("  API Key: {$plainKey}");
        }
    }
}
