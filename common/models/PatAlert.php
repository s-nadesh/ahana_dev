<?php

namespace common\models;

use common\models\query\PatAlertQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_alert".
 *
 * @property integer $pat_alert_id
 * @property integer $tenant_id
 * @property integer $alert_id
 * @property integer $patient_id
 * @property string $alert_description
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatPatient $patient
 * @property CoAlert $alert
 * @property CoTenant $tenant
 */
class PatAlert extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_alert';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['alert_id', 'patient_id', 'alert_description'], 'required'],
                [['tenant_id', 'alert_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['alert_description', 'status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at'], 'safe'],
//            [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'patient_id', 'alert_id', 'deleted_at'], 'message' => 'The combination of alert has already been taken.'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'pat_alert_id' => 'Pat Alert',
            'tenant_id' => 'Tenant ID',
            'alert_id' => 'Alert',
            'patient_id' => 'Patient',
            'alert_description' => 'Name',
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
    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getAlert() {
        return $this->hasOne(CoAlert::className(), ['alert_id' => 'alert_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public static function find() {
        return new PatAlertQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'alert_type' => function ($model) {
                return (isset($model->alert->alert_name)) ? $model->alert->alert_name : '-';
            },
            'created_by' => function ($model) {
                return $model->createdUser->name;
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            $message = "Patient Alert ({$this->alert_description}) added.";
        } else {
            $message = "Patient Alert ({$this->alert_description}) updated.";
        }

        $encounter_id = !empty($this->patient->patActiveEncounter) ? $this->patient->patActiveEncounter->encounter_id : null;
        if (is_null($encounter_id)) {
            $encounter_id = !empty($this->patient->patPreviousEncounter) ? $this->patient->patPreviousEncounter->encounter_id : null;
        }

        PatTimeline::insertTimeLine($this->patient_id, $this->created_at, 'Patient Alert', '', $message, 'ALERT', $encounter_id);

        return parent::afterSave($insert, $changedAttributes);
    }

}
