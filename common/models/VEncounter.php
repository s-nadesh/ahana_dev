<?php

namespace common\models;

use Yii;

/**
 * This is the model class for table "v_encounter".
 *
 * @property integer $id
 * @property integer $encounter_id
 * @property string $date
 * @property string $type
 * @property string $details
 * @property string $doctor
 * @property integer $patient_id
 * @property string $patient_guid
 * @property string $encounter_type
 * @property string $status
 * @property string $date_time
 */
class VEncounter extends \common\models\RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'v_encounter';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['id', 'encounter_id', 'patient_id'], 'integer'],
            [['date_time'], 'safe'],
            [['date'], 'string', 'max' => 21],
            [['type'], 'string', 'max' => 17],
            [['details'], 'string', 'max' => 214],
            [['doctor'], 'string', 'max' => 60],
            [['patient_guid'], 'string', 'max' => 50],
            [['encounter_type'], 'string', 'max' => 5],
            [['status'], 'string', 'max' => 1]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'id' => 'ID',
            'encounter_id' => 'Encounter ID',
            'date' => 'Date',
            'type' => 'Type',
            'details' => 'Details',
            'doctor' => 'Doctor',
            'patient_id' => 'Patient ID',
            'patient_guid' => 'Patient Guid',
            'encounter_type' => 'Encounter Type',
            'status' => 'Status',
            'date_time' => 'Date Time',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getEncounter() {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

}
