<?php

namespace common\models;

use Yii;
use yii\db\ActiveRecord;

/**
 * This is the model class for table "pat_diagnosis".
 *
 * @property integer $diag_id
 * @property string $diag_name
 * @property string $diag_description
 * @property integer $diag_id_0
 * @property integer $level
 */
class PatDiagnosis extends ActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_diagnosis';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['diag_name', 'diag_description'], 'required'],
            [['diag_description'], 'string'],
            [['diag_id_0', 'level'], 'integer'],
            [['diag_name'], 'string', 'max' => 50]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'diag_id' => 'Diag ID',
            'diag_name' => 'Diag Name',
            'diag_description' => 'Diag Description',
            'diag_id_0' => 'Diag Id 0',
            'level' => 'Level',
        ];
    }

    public static function getDb() {
        return Yii::$app->client;
    }

}
