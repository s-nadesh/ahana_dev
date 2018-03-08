<?php

namespace common\models;

use common\models\query\PatBillingLogQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_billing_log".
 *
 * @property integer $billing_log_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property integer $encounter_id
 * @property string $date_time
 * @property string $log_type
 * @property string $header
 * @property string $activity
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatBillingLog extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_billing_log';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['patient_id', 'encounter_id', 'date_time', 'log_type', 'header', 'activity'], 'required'],
                [['tenant_id', 'patient_id', 'encounter_id', 'created_by', 'modified_by'], 'integer'],
                [['date_time', 'created_at', 'modified_at', 'deleted_at'], 'safe'],
                [['log_type', 'activity', 'status'], 'string'],
                [['header'], 'string', 'max' => 250],
                [['encounter_id'], 'exist', 'skipOnError' => true, 'targetClass' => PatEncounter::className(), 'targetAttribute' => ['encounter_id' => 'encounter_id']],
                [['patient_id'], 'exist', 'skipOnError' => true, 'targetClass' => PatPatient::className(), 'targetAttribute' => ['patient_id' => 'patient_id']],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'billing_log_id' => 'Billing Log ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'encounter_id' => 'Encounter ID',
            'date_time' => 'Date Time',
            'log_type' => 'Log Type',
            'header' => 'Header',
            'activity' => 'Activity',
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
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function insertBillingLog($patient_id, $encounter_id, $date_time, $log_type, $header, $activity) {
        $model = new PatBillingLog;
        $model->attributes = [
            'patient_id' => $patient_id,
            'encounter_id' => $encounter_id,
            'date_time' => $date_time,
            'log_type' => $log_type,
            'header' => $header,
            'activity' => $activity,
        ];
        $model->save(false);
    }
    
    public function fields() {
        $extend = [
            'log_type_name' => function ($model) {
                if($this->log_type == 'N'){
                    return 'Non Recurring';
                } else {
                    return 'Recurring';
                }
            },
            'activity_by' => function ($model) {
                return $model->createdUser->title_code . ' '. $model->createdUser->name;
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
    
    public static function find() {
        return new PatBillingLogQuery(get_called_class());
    }

}
