import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-white overflow-hidden">

            {/* Elementos decorativos de fondo */}
            <div className="absolute inset-0 overflow-hidden">

                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>

                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

            </div>



            <div className="relative z-10 w-full max-w-md px-4">

                <div className="text-center mb-8">

                    <Link
                        href="/"
                        className="inline-block"
                    >

                        <div className="flex justify-center mb-4">

                            <ApplicationLogo className="h-16 w-auto" />

                        </div>


                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">

                            AquaSense IoT

                        </h1>


                        <p className="text-gray-600 mt-2">
                            Monitoreo inteligente del agua
                        </p>

                    </Link>

                </div>



                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">

                    {children}

                </div>

            </div>

        </div>
    );
}
