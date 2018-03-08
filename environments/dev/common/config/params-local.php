<?php
return [
    'ADMIN_BASE_URL' => 'http://hms.ark/crm/',
    'ORG_BASE_URL' => isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '',
    'SECURITY_SALT' => 'DYhG93',
];

