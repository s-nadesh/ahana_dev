<?php

Yii::setAlias('common', dirname(__DIR__));
Yii::setAlias('IRISADMIN', dirname(dirname(__DIR__)) . '/IRISADMIN');
Yii::setAlias('IRISORG', dirname(dirname(__DIR__)) . '/IRISORG');
Yii::setAlias('console', dirname(dirname(__DIR__)) . '/console');

if (isset($_SERVER['HTTP_X_DOMAIN_PATH'])) {
    defined('DOMAIN_PATH') or define('DOMAIN_PATH', $_SERVER['HTTP_X_DOMAIN_PATH']);
}