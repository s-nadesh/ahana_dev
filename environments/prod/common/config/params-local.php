<?php
return [
    'ADMIN_BASE_URL' => 'http://demo.arkinfotec.in/ahana/demo/crm/',
    'ORG_BASE_URL' => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
    'SECURITY_SALT' => 'DYhG93',
];