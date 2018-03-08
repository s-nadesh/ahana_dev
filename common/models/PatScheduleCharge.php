<?php

namespace common\models;

use common\models\query\PatScheduleChargesQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_schedule_charge".
 *
 * @property integer $schedule_charge_id
 * @property integer $other_charge_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $no_of_days
 * @property integer $until_discharge
 * @property integer $cron_status
 * @property integer $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PatScheduleCharge extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_schedule_charge';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['other_charge_id', 'tenant_id', 'encounter_id', 'patient_id', 'no_of_days', 'until_discharge', 'cron_status', 'status', 'created_by', 'modified_by'], 'integer'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'schedule_charge_id' => 'Schedule Charge ID',
            'other_charge_id' => 'Other Charge ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'no_of_days' => 'No Of Days',
            'until_discharge' => 'Until Discharge',
            'cron_status' => 'Cron Status',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getEncounter() {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id'])->andWhere('status = "1"');
    }
    
    public static function find() {
        return new PatScheduleChargesQuery(get_called_class());
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Schedule Charge Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Schedule Charge Stoped Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatScheduleCharge::tableName(), $this->schedule_charge_id, $activity, $this->tenant_id, $this->created_by, 'patient.scheduleCharge');
        return parent::afterSave($insert, $changedAttributes);
    }

}
