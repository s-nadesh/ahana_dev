<?php

namespace common\models;

use Yii;

class PActiveRecord extends RActiveRecord {

    public static function getDb() {
        //return Yii::$app->pms;
        return Yii::$app->client_pharmacy;
    }

}
