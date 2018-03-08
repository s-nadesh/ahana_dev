<?php

$params = array_merge(
        require(__DIR__ . '/../../common/config/params.php'), require(__DIR__ . '/../../common/config/params-local.php'), require(__DIR__ . '/params.php'), require(__DIR__ . '/params-local.php')
);

return [
    'timezone' => 'Asia/Kolkata',
    'id' => 'app-IRISADMIN',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'IRISADMIN\controllers',
    'modules' => [
        'v1' => [
            'basePath' => '@app/modules/v1',
            'class' => 'IRISADMIN\modules\v1\Module',
        ],
        'gii' => [
            'class' => 'yii\gii\Module',
        ],
    ],
    'components' => [
        'user' => [
            'identityClass' => 'common\models\CoSuperAdmin',
            'enableSession' => false,
            'loginUrl' => null,
        ],
        'request' => [
            'class' => '\yii\web\Request',
            'enableCookieValidation' => false,
            'enableCsrfValidation' => false,
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ],
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'enableStrictParsing' => false,
            'showScriptName' => false,
            'rules' => [
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/user'], 'extraPatterns' => ['POST login' => 'login']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/organization'], 'extraPatterns' => ['GET search' => 'search', 'POST createorg' => 'createorg', 'POST updateorg' => 'updateorg', 'GET getorg' => 'getorg', 'POST validateorg' => 'validateorg', 'GET getorglist' => 'getorglist', 'GET getorganization' => 'getorganization',  'POST createdb' => 'createdb']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/country'], 'extraPatterns' => ['POST remove' => 'remove']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/state'], 'extraPatterns' => ['POST remove' => 'remove']],
                ['class' => 'yii\rest\UrlRule', 'controller' => ['v1/city'], 'extraPatterns' => ['POST remove' => 'remove']],
            ],
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'errorHandler' => [
            'errorAction' => 'v1/site/error',
        ],
    ],
    'params' => $params,
];
