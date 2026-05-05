import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail01Icon } from 'hugeicons-react';

export default function VerifyEmail({ status }) {

    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };


    return (

        <GuestLayout>
            <Head title="Verificar correo - AquaSense IoT" />

            {/* Encabezado */}
            <div className="mb-6">
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mail01Icon className="w-7 h-7 text-blue-600" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 text-center">
                    Verifica tu correo electrónico
                </h2>

                <p className="text-gray-600 mt-3 text-center">
                    Gracias por registrarte en AquaSense IoT.
                    Antes de comenzar, verifica tu correo electrónico haciendo clic en el enlace que acabamos de enviarte.
                    Si no lo recibiste, puedes solicitar uno nuevo.
                </p>
            </div>

            {/* Estado */}
            {
                status === 'verification-link-sent' && (
                    <div className="mb-4 text-sm font-medium text-green-600 text-center">
                        Hemos enviado un nuevo enlace de verificación a tu correo electrónico.
                    </div>
                )
            }

            <form
                onSubmit={submit}
                className="space-y-4"
            >

                {/* Botón reenviar */}
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
                            : 'Reenviar correo de verificación'
                    }
                </PrimaryButton>

                {/* Logout */}
                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm text-gray-600 hover:text-red-600 transition"
                    >
                        Cerrar sesión
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
