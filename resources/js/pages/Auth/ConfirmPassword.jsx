import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import React, { useState } from "react";
import { Head, useForm } from '@inertiajs/react';
import {
    SquareLock01Icon,
    ViewIcon,
    ViewOffIcon
} from 'hugeicons-react';

export default function ConfirmPassword() {

    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);


    const submit = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };


    return (
        <GuestLayout>
            <Head title="Confirmar identidad - AquaSense IoT" />

            {/* Encabezado */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Confirmar identidad
                </h2>
                <p className="text-gray-600 mt-1">
                    Esta es una zona segura del sistema. Confirma tu contraseña para continuar.
                </p>
            </div>

            <form
                onSubmit={submit}
                className="space-y-5"
            >

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
                            isFocused={true}
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
                                    ? (
                                        <ViewOffIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )
                                    : (
                                        <ViewIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )
                            }
                        </button>
                    </div>

                    <InputError
                        message={errors.password}
                        className="mt-1"
                    />
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

                                    Verificando...

                                </div>
                            )
                            : 'Confirmar'
                    }
                </PrimaryButton>
            </form>
        </GuestLayout>

    );

}
