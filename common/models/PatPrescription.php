<?php

namespace common\models;

use common\models\query\PatPrescriptionQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;
use common\models\AppConfiguration;

/**
 * This is the model class for table "pat_prescription".
 *
 * @property integer $pres_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property string $pres_date
 * @property integer $consultant_id
 * @property integer $number_of_days
 * @property string $notes
 * @property string $next_visit
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
 * @property PatPrescriptionFavourite[] $patPrescriptionFavourites
 * @property PatPrescriptionItems[] $patPrescriptionItems
 */
class PatPrescription extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_prescription';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['encounter_id', 'patient_id', 'pres_date', 'consultant_id'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'consultant_id', 'number_of_days', 'created_by', 'modified_by'], 'integer'],
                [['pres_date', 'next_visit', 'created_at', 'modified_at', 'deleted_at', 'diag_id'], 'safe'],
                [['notes', 'status'], 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'pres_id' => 'Pres ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter',
            'patient_id' => 'Patient',
            'pres_date' => 'Pres Date',
            'consultant_id' => 'Consultant',
            'diag_id' => 'Diag',
            'number_of_days' => 'Number Of Days',
            'notes' => 'Notes',
            'next_visit' => 'Next Visit',
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
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id', 'patient_id' => 'patient_id']);
    }

    public function getAllergies() {
        return $this->hasOne(PatAllergies::className(), ['encounter_id' => 'encounter_id'])->status()->active()->orderBy(['created_at' => SORT_DESC])->limit(1);
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
    public function getDiagnosis() {
        return $this->hasOne(PatDiagnosis::className(), ['diag_id' => 'diag_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatPrescriptionFavourites() {
        return $this->hasMany(PatPrescriptionFavourite::className(), ['pres_id' => 'pres_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatPrescriptionItems() {
        return $this->hasMany(PatPrescriptionItems::className(), ['pres_id' => 'pres_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getConsultant() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'consultant_id']);
    }

    public function beforeSave($insert) {
        if ($insert) {
            if (!empty($this->number_of_days)) {
            $this->next_visit = $this->patient->getPatientNextvisitDate($this->number_of_days);
        }
            $appConfiguration = AppConfiguration::find()
                    ->tenant()
                    ->andWhere(['<>', 'value', '0'])
                    ->andWhere(['code' => 'PB'])
                    ->one();
            if(!empty($appConfiguration)) {
                $this->pharmacy_tenant_id = $appConfiguration['value'];
            }
        }

        return parent::beforeSave($insert);
    }

    public static function find() {
        return new PatPrescriptionQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'items' => function ($model) {
                return (isset($model->patPrescriptionItems) ? $model->patPrescriptionItems : '-');
            },
            'consultant_name' => function ($model) {
                return (isset($model->consultant) ? $model->consultant->title_code . ucwords($model->consultant->name) : '-');
            },
            'encounter' => function ($model) {
                return (isset($model->encounter) ? $model->encounter->patVitals : '-');
            },
            'diag_name' => function ($model) {
                if (isset($model->diagnosis)) {
                    $result = '';
                    if ($model->diagnosis->diag_name != '') {
                        $result .= $model->diagnosis->diag_name . ' - ';
                    }
                    if ($model->diagnosis->diag_description != '') {
                        $result .= $model->diagnosis->diag_description;
                    }
                    return $result;
                }
            },
            'allergies' => function ($model) {
                return (isset($model->allergies) ? $model->allergies->notes : '');
            },
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
        ];
//        $fields = array_merge(parent::fields(), $extend);
//        return $fields;
        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'presc_print':
                    $addt_keys = ['items', 'consultant_name', 'encounter', 'diag_name', 'allergies', 'branch_name'];
                    $parent_fields = [
                        'pres_id' => 'pres_id',
                        'next_visit' => 'next_visit',
                    ];
                    break;
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert)
            $activity = 'Prescription Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Prescription Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PhaBrand::tableName(), $this->pres_id, $activity);
        return parent::afterSave($insert, $changedAttributes);
    }
    
    public function getPrescriptionItemIds() {
        return ArrayHelper::map($this->patPrescriptionItems, 'pres_item_id', 'pres_item_id');
    }

}
