<?php

$client = [];
if (defined('DOMAIN_PATH')) {
    if (isset(Yii::$app->session['client']) && isset(Yii::$app->session['client_pharmacy']) && isset(Yii::$app->session['current_domain_path']) && Yii::$app->session['current_domain_path'] == DOMAIN_PATH && Yii::$app->session['is_read']) {
        $client['client'] = Yii::$app->session['client'];
        $client['client_pharmacy'] = Yii::$app->session['client_pharmacy'];
    } else {
        $new_db = setClientDb();
        $client['client'] = $new_db[0];
        $client['client_pharmacy'] = $new_db[1];
    }
}

return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'components' => array_merge(['cache' => [
            'class' => 'yii\caching\FileCache',
        ]], $client)
];

function setClientDb() {
    $main = require_once(__DIR__ . '/main-local.php');

    $db = $main['components']['db'];
    $dbh = new PDO($db['dsn'], $db['username'], $db['password']);

    $sql = 'SELECT * FROM co_organization WHERE org_domain = :domain';
    $sth = $dbh->prepare($sql);
    $sth->execute(array(':domain' => DOMAIN_PATH));
    $read = $sth->fetch(PDO::FETCH_OBJ);

    $client = [
        'class' => 'yii\db\Connection',
        'enableSchemaCache' => false,
//        'schemaCacheDuration' => 3600,
//        'schemaCache' => 'cache',
        'charset' => 'utf8'
    ];
    $pharmacy_client = [
        'class' => 'yii\db\Connection',
        'enableSchemaCache' => false,
        'charset' => 'utf8'
    ];

    $is_read = false;
    if (!empty($read)) {
        $is_read = true;

        $read->org_db_host = base64_decode($read->org_db_host);
        $read->org_db_username = base64_decode($read->org_db_username);
        $read->org_db_password = base64_decode($read->org_db_password);
        $read->org_database = base64_decode($read->org_database);
        $read->org_db_pharmacy = base64_decode($read->org_db_pharmacy);

        $client['dsn'] = "mysql:host={$read->org_db_host};dbname={$read->org_database}";
        $client['username'] = "{$read->org_db_username}";
        $client['password'] = "{$read->org_db_password}";

        $pharmacy_client['dsn'] = "mysql:host={$read->org_db_host};dbname={$read->org_db_pharmacy}";
        $pharmacy_client['username'] = "{$read->org_db_username}";
        $pharmacy_client['password'] = "{$read->org_db_password}";
    }

    Yii::$app->session['client'] = $client;
    Yii::$app->session['client_pharmacy'] = $pharmacy_client;
    Yii::$app->session['current_domain_path'] = DOMAIN_PATH;
    Yii::$app->session['is_read'] = $is_read;

    return array($client, $pharmacy_client);
}
