import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import React, { useState } from "react";
import { Head, Link, useForm } from '@inertiajs/react';
import {
    UserIcon,
    MailAtSign01Icon,
    SquareLock01Icon,
    ViewIcon,
    ViewOffIcon
} from 'hugeicons-react';

export default function Register() {

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>

            <Head title="Registro - AquaSense IoT" />

            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Crear cuenta
                </h2>

                <p className="text-gray-600 mt-1">
                    Únete a AquaSense IoT y comienza a monitorear la calidad del agua
                </p>
            </div>


            <form onSubmit={submit} className="space-y-5">

                {/* Nombre */}
                <div>

                    <InputLabel
                        htmlFor="name"
                        value="Nombre completo"
                        className="text-gray-700 font-medium"
                    />

                    <div className="relative mt-1">

                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>

                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            className="pl-10 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            autoComplete="name"
                            isFocused={true}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            placeholder="Juan Pérez"
                        />

                    </div>

                    <InputError
                        message={errors.name}
                        className="mt-1"
                    />

                </div>


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
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            placeholder="correo@ejemplo.com"
                        />

                    </div>

                    <InputError
                        message={errors.email}
                        className="mt-1"
                    />

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
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            placeholder="••••••••"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >

                            {
                                showPassword
                                    ? <ViewOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    : <ViewIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            }

                        </button>

                    </div>

                    <InputError
                        message={errors.password}
                        className="mt-1"
                    />

                </div>


                {/* Confirmar contraseña */}
                <div>

                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirmar contraseña"
                        className="text-gray-700 font-medium"
                    />

                    <div className="relative mt-1">

                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SquareLock01Icon className="h-5 w-5 text-gray-400" />
                        </div>

                        <TextInput
                            id="password_confirmation"
                            type={showPasswordConfirmation ? "text" : "password"}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="pl-10 pr-10 block w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            autoComplete="new-password"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            placeholder="••••••••"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >

                            {
                                showPasswordConfirmation
                                    ? <ViewOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    : <ViewIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                            }

                        </button>

                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1"
                    />

                </div>


                {/* Botones */}
                <div className="flex flex-col space-y-4 pt-2">

                    <PrimaryButton
                        className="w-full justify-center py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold text-white transition-all duration-200 transform hover:scale-[1.02]"
                        disabled={processing}
                    >

                        {
                            processing
                                ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creando cuenta...
                                    </div>
                                )
                                : 'Crear cuenta'
                        }

                    </PrimaryButton>


                    <div className="text-center">

                        <Link
                            href={route('login')}
                            className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                        >

                            ¿Ya tienes una cuenta?
                            <span className="font-medium">
                                {' '}Inicia sesión
                            </span>

                        </Link>

                    </div>

                </div>

            </form>

        </GuestLayout>
    );
}
