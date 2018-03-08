<?php

namespace common\models;

use common\models\query\PatVitalsQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_vitals".
 *
 * @property integer $vital_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $vital_time
 * @property string $temperature
 * @property string $blood_pressure_systolic
 * @property string $blood_pressure_diastolic
 * @property string $pulse_rate
 * @property string $weight
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
class PatVitals extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_vitals';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
//            [['temperature'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'created_by', 'modified_by'], 'integer'],
                [['vital_time', 'created_at', 'modified_at', 'deleted_at', 'bmi'], 'safe'],
                [['status'], 'string'],
            //[['temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'pulse_rate'], 'string', 'max' => 20],
            //[['weight', 'height', 'sp02'], 'string', 'max' => 10],
            //[['pain_score'], 'number', 'min' => 0, 'max' => 10,'numberPattern' => '/(^\d+\.\d+$)|(^\d+$)/', 'message' => 'Invalid Pain Score'],
            [['pain_score'], 'number', 'min' => 0, 'max' => 10],
                [['sp02'], 'number', 'min' => 0, 'max' => 100],
                [['height'], 'number', 'min' => 30, 'max' => 200],
                [['weight'], 'number', 'min' => 0, 'max' => 150],
                [['pulse_rate'], 'number', 'min' => 15, 'max' => 150],
                [['blood_pressure_systolic', 'blood_pressure_diastolic'], 'number', 'min' => 0, 'max' => 200],
                [['temperature'], 'number', 'min' => 80, 'max' => 120]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'vital_id' => 'Vital ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'vital_time' => 'Vital Time',
            'temperature' => 'Temperature',
            'blood_pressure_systolic' => 'Blood Pressure Systolic',
            'blood_pressure_diastolic' => 'Blood Pressure Diastolic',
            'pulse_rate' => 'Pulse Rate',
            'weight' => 'Weight',
            'height' => 'Height',
            'sp02' => 'Sp02',
            'pain_score' => 'Pain Score',
            'bmi' => 'BMI',
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

    /**
     * @return ActiveQuery
     */
    public function getVitalsUsers() {
        return $this->hasMany(PatVitalsUsers::className(), ['vital_id' => 'vital_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getUsers() {
        return $this->hasMany(CoUser::className(), ['user_id' => 'user_id'])->via('vitalsUsers');
    }

    public static function find() {
        return new PatVitalsQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'encounter_status' => function ($model) {
                return $model->encounter->isActiveEncounter();
            },
            'created_date' => function ($model) {
                return date('Y-m-d', strtotime($model->created_at));
            },
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
        ];

        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'eprvitals':
                    $parent_fields = [
                        'vital_id' => 'vital_id',
                        'tenant_id' => 'tenant_id',
                        'encounter_id' => 'encounter_id',
                        'patient_id' => 'patient_id',
                        'vital_time' => 'vital_time',
                        'temperature' => 'temperature',
                        'blood_pressure_systolic' => 'blood_pressure_systolic',
                        'blood_pressure_diastolic' => 'blood_pressure_diastolic',
                        'pulse_rate' => 'pulse_rate',
                        'weight' => 'weight',
                        'height' => 'height',
                        'sp02' => 'sp02',
                        'pain_score' => 'pain_score',
                        'bmi' => 'bmi',
                        'status' => 'status',
                        'created_at' => 'created_at',
                    ];
                    $addt_keys = ['encounter_status', 'created_date', 'branch_name'];
                    break;
                case 'presc_print':
                    $addt_keys = false;
                    $parent_fields = [
                        'temperature' => 'temperature',
                        'blood_pressure_systolic' => 'blood_pressure_systolic',
                        'blood_pressure_diastolic' => 'blood_pressure_diastolic',
                        'pulse_rate' => 'pulse_rate',
                        'weight' => 'weight',
                        'height' => 'height',
                        'sp02' => 'sp02',
                        'pain_score' => 'pain_score',
                        'bmi' => 'bmi',
                    ];
                    break;
            endswitch;
        }

        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function beforeSave($insert) {
        $encounter = PatEncounter::findOne(['encounter_id' => $this->encounter_id]);
        if ($encounter->patient_id != $this->patient_id) {
            return false;
        }
        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Vital Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Vital Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatVitals::tableName(), $this->vital_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }

}
