import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import { MailAtSign01Icon } from 'hugeicons-react';

export default function ForgotPassword({ status }) {

    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };


    return (

        <GuestLayout>
            <Head title="Recuperar acceso - AquaSense IoT" />

            {/* Encabezado */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                    Recuperar acceso
                </h2>
                <p className="text-gray-600 mt-1">
                    Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
            </div>

            {/* Mensaje éxito */}
            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form
                onSubmit={submit}
                className="space-y-5"
            >
                {/* Correo */}
                <div>

                    <label className="text-gray-700 font-medium">
                        Correo electrónico
                    </label>

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
                            isFocused={true}
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

                                    Enviando...

                                </div>
                            )
                            : 'Enviar enlace de recuperación'
                    }
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}
