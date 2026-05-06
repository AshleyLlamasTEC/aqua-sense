<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * Root template.
     */
    protected $rootView = 'app';


    /**
     * Asset versioning.
     */
    public function version(
        Request $request
    ): ?string {
        return parent::version(
            $request
        );
    }


    /**
     * Shared props.
     */
    public function share(
        Request $request
    ): array {
        return array_merge(
            parent::share(
                $request
            ),
            [

                /*
                |--------------------------------------------------------------------------
                | Auth
                |--------------------------------------------------------------------------
                */
                'auth' => [

                    'user' => fn () =>
                        $request->user(),

                ],


                /*
                |--------------------------------------------------------------------------
                | Flash messages
                |--------------------------------------------------------------------------
                */
                'flash' => [

                    'success' => fn () =>
                        $request->session()->get(
                            'success'
                        ),

                    'error' => fn () =>
                        $request->session()->get(
                            'error'
                        ),

                    'warning' => fn () =>
                        $request->session()->get(
                            'warning'
                        ),

                    'info' => fn () =>
                        $request->session()->get(
                            'info'
                        ),

                ],

            ]
        );
    }
}
