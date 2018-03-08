<?php
return [
    'components' => [
        'db' => [
            'class' => 'yii\db\Connection',
            'dsn' => "mysql:host=localhost;dbname=rajencba_ahanademo",
            'username' => 'rajencba_ahana',
            'password' => 's6(Srsh7_qQL',
            'charset' => 'utf8',
        ],
        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            'viewPath' => '@common/mail',
            // send all mails to a file by default. You have to set
            // 'useFileTransport' to false and configure a transport
            // for the mailer to send real emails.
//            'useFileTransport' => true,
            'transport' => [
                'class' => 'Swift_SmtpTransport',
                'host' => 'smtp.gmail.com',
                'username' => 'marudhuofficial@gmail.com',
                'password' => 'ninja12345',
                'port' => '465', // Port: 465 or 587
                'encryption' => 'ssl',
            ],
        ],
    ],
];

