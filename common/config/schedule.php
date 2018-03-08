<?php

use omnilight\scheduling\Schedule;
use yii\console\Application;
/**
 * @var Schedule $schedule
 */

// Place here all of your cron jobs

// This command will execute ls command every five minutes
$schedule->exec('ls')->everyFiveMinutes();

// This command will execute migration command of your application every hour
//$schedule->command('migrate')->hourly();

// This command will call callback function every day at 10:00
$schedule->call(function(Application $app) {
    // root of directory yii2
        // /var/www/html/<yii2>
        $rootyii = realpath(dirname(__FILE__).'/../../');
 
        // create file <jam:menit:detik>.txt
        $filename = date('H:i:s') . '.txt';
        $folder = $rootyii.'/cronjob/'.$filename;
        $f = fopen($folder, 'w');
        $fw = fwrite($f, 'now : ' . $filename);
        fclose($f);
})->everyMinute();