import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import React, { useState } from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import {
    MailAtSign01Icon,
    SquareLock01Icon,
    ViewIcon,
    ViewOffIcon
} from 'hugeicons-react';

export default function Login({ status, canResetPassword }) {

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>

            <Head title="Iniciar sesión - AquaSense IoT" />


            <div className="mb-6">

                <h2 className="text-2xl font-bold text-gray-900">
                    Bienvenida de nuevo
                </h2>

                <p className="text-gray-600 mt-1">
                    Accede a tu panel de monitoreo AquaSense
                </p>

            </div>


            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}


            <form onSubmit={submit} className="space-y-5">

                {/* Correo */}
                <div>

                    <InputLabel
                        htmlFor="email"
                        value="Correo electrónico"
                        className="text-gray-700 font-medium"
                    />

                    <div className="relative mt-1">

                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MailAtSign01Icon className="h-5 w-5 text-gray-400" />
                        </div>

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="pl-10 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="correo@ejemplo.com"
                        />

                    </div>

                    <InputError message={errors.email} className="mt-1" />

                </div>


                {/* Contraseña */}
                <div>

                    <InputLabel
                        htmlFor="password"
                        value="Contraseña"
                        className="text-gray-700 font-medium"
                    />

                    <div className="relative mt-1">

                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SquareLock01Icon className="h-5 w-5 text-gray-400" />
                        </div>

                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="pl-10 pr-10 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="••••••••"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            {showPassword ? (
                                <ViewOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            ) : (
                                <ViewIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            )}
                        </button>

                    </div>

                    <InputError message={errors.password} className="mt-1" />

                </div>


                {/* Recordarme */}
                <div className="flex items-center justify-between">

                    <label className="flex items-center">

                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />

                        <span className="ms-2 text-sm text-gray-600">
                            Recordarme
                        </span>

                    </label>


                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-blue-600 hover:text-blue-800 transition"
                        >
                            ¿Olvidaste tu contraseña?
                        </Link>
                    )}

                </div>


                {/* Botón */}
                <PrimaryButton
                    className="w-full justify-center py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={processing}
                >

                    {
                        processing
                            ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Iniciando sesión...
                                </div>
                            )
                            : 'Iniciar sesión'
                    }

                </PrimaryButton>


                {/* Registro */}
                <div className="text-center pt-2">

                    <Link
                        href={route('register')}
                        className="text-sm text-gray-600 hover:text-blue-600 transition"
                    >

                        ¿No tienes cuenta?
                        <span className="font-medium">
                            {' '}Regístrate
                        </span>

                    </Link>

                </div>

            </form>

        </GuestLayout>
    );
}
