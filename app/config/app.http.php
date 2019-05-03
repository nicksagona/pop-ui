<?php

return [
    'routes'   => [
        '[/]'  => [
            'controller' => 'Pop\Ui\Http\Controller\IndexController',
            'action'     => 'index'
        ],
        '/users[/]'  => [
            'controller' => 'Pop\Ui\Http\Controller\UsersController',
            'action'     => 'index'
        ],
        '/users/export[/]'  => [
            'controller' => 'Pop\Ui\Http\Controller\UsersController',
            'action'     => 'export'
        ],
        '*'    => [
            'controller' => 'Pop\Ui\Http\Controller\IndexController',
            'action'     => 'error'
        ]
    ],
    'http_options_headers' => [
        'Access-Control-Allow-Origin'  => '*',
        'Access-Control-Allow-Headers' => 'Accept, Authorization, Content-Type, X-Resource, X-Permission',
        'Access-Control-Allow-Methods' => 'HEAD, OPTIONS, GET, PUT, POST, PATCH, DELETE',
        'Content-Type'                 => 'application/json'
    ],
    'pagination' => 20,
    'numbered'   => true
];