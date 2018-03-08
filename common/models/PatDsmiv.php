<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "pat_dsmiv".
 *
 * @property integer $dsmiv_id
 * @property string $sub
 * @property string $code
 * @property string $main
 * @property integer $axis
 */
class PatDsmiv extends ActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_dsmiv';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['sub', 'code', 'main', 'axis'], 'required'],
            [['axis'], 'integer'],
            [['sub', 'code', 'main'], 'string', 'max' => 300]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'dsmiv_id' => 'Dsmiv ID',
            'sub' => 'Sub',
            'code' => 'Code',
            'main' => 'Main',
            'axis' => 'Axis',
        ];
    }

    public static function getDb() {
        return Yii::$app->client;
    }

}
