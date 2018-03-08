<?php

namespace common\models;

use common\models\query\PatProcedureQuery;
use Yii;
use yii\db\ActiveQuery;
use yii\helpers\ArrayHelper;
use yii\helpers\Json;

/**
 * This is the model class for table "pat_procedure".
 *
 * @property integer $proc_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $charge_subcat_id
 * @property string $proc_date
 * @property string $proc_consultant_ids
 * @property string $proc_description
 * @property string $charge_amount
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatEncounter $encounter
 * @property CoRoomChargeCategory $chargeCat
 * @property CoTenant $tenant
 * @property PatPatient $patient
 */
class PatProcedure extends RActiveRecord {

    public $charge_sub_category;
    public $branch_name;
    public $total_charge_amount;
    public $total_visit;
    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_procedure';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['charge_subcat_id', 'proc_date'], 'required'],
                [['tenant_id', 'encounter_id', 'charge_subcat_id', 'created_by', 'modified_by', 'patient_id'], 'integer'],
                [['proc_date', 'created_at', 'modified_at', 'deleted_at', 'patient_id', 'charge_amount'], 'safe'],
                [['proc_consultant_ids', 'proc_description', 'status'], 'string'],
                [['proc_date'], 'validateProcedure']
        ];
    }

    public function validateProcedure($attribute, $params) {
        $discharge = PatAdmission::find()
                ->where([
                    'pat_admission.encounter_id' => $this->encounter_id,
                ])
                ->andWhere(['admission_status' => 'CD'])
                ->one();
        if (!empty($discharge)) {
            $discharge_date = new \DateTime($discharge->status_date);
            $proc_date = new \DateTime($this->proc_date);
            if ($discharge_date <= $proc_date) {
                $this->addError($attribute, "Procedure Date must be less than the Discharge date( {$discharge->status_date} )");
            }
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'proc_id' => 'Proc',
            'tenant_id' => 'Tenant',
            'encounter_id' => 'Encounter',
            'charge_subcat_id' => 'Procedure',
            'proc_date' => 'Date',
            'proc_consultant_ids' => 'Consultant',
            'proc_description' => 'Description',
            'charge_amount' => 'Charge Amount',
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
    public function getChargeCat() {
        return $this->hasOne(CoRoomChargeSubcategory::className(), ['charge_subcat_id' => 'charge_subcat_id']);
    }

    public function getAdmission() {
        return $this->hasMany(PatAdmission::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public function getPatient() {
        return $this->hasOne(PatPatient::className(), ['patient_id' => 'patient_id']);
    }

    public static function find() {
        return new PatProcedureQuery(get_called_class());
    }

    public function beforeValidate() {
        $this->_setConsultId();
        return parent::beforeValidate();
    }

    public function beforeSave($insert) {
        $this->_setConsultId();

        $type = $this->encounter->encounter_type;

        if ($type == 'IP') {
            $charge_link_id = $this->encounter->patCurrentAdmission->room_type_id;
        } else {
            $charge_link_id = $this->patient->patient_category_id;
        }

        $this->charge_amount = CoChargePerCategory::getChargeAmount(1, 'C', $this->charge_subcat_id, $type, $charge_link_id);
        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        $procedure = "Procedure : <b>{$this->chargeCat->charge_subcat_name}</b>";

        if ($insert) {
            $this->proc_consultant_ids = Json::decode($this->proc_consultant_ids);
            $message = $this->proc_description != '' ? "{$this->proc_description} <br /> $procedure" : $procedure;
        } else {
            $message = $this->proc_description != '' ? "Updated: {$this->proc_description} <br /> $procedure" : "Updated: $procedure";
        }
        PatTimeline::insertTimeLine($this->patient_id, $this->proc_date, 'Procedure', '', $message, 'PROCEDURE', $this->encounter_id);
        $this->_updateConsultant($insert);

        if ($insert)
            $activity = 'Procedure Added Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Procedure Updated Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatProcedure::tableName(), $this->proc_id, $activity);

        return parent::afterSave($insert, $changedAttributes);
    }

    private function _updateConsultant($insert) {
        $deleted_consultant_ids = $consultant_ids = [];
        if ($insert) {
            $consultant_ids = $this->proc_consultant_ids;
        } else {
            $saved_consultant_ids = Json::decode($this->proc_consultant_ids);
            $existing_consultant_ids = ArrayHelper::map(PatConsultant::find()->tenant()->andWhere(['proc_id' => $this->proc_id])->all(), 'pat_consult_id', 'consultant_id');

            $consultant_ids = array_diff($saved_consultant_ids, $existing_consultant_ids);
            $deleted_consultant_ids = array_diff($existing_consultant_ids, $saved_consultant_ids);
        }

        if (!empty($consultant_ids)) {
            foreach ($consultant_ids as $key => $consultant_id) {
                $model = new PatConsultant;
                $model->attributes = [
                    'encounter_id' => $this->encounter_id,
                    'patient_id' => $this->patient_id,
                    'consultant_id' => $consultant_id,
                    'proc_id' => $this->proc_id,
                    'consult_date' => $this->proc_date,
                    'notes' => "Consulted for Procedure ({$this->chargeCat->charge_subcat_name})",
                ];
                $model->save(false);
            }
        }

        if (!empty($deleted_consultant_ids)) {
            foreach ($deleted_consultant_ids as $pat_consult_id => $consultant_id) {
                $model = PatConsultant::find()->tenant()->andWhere(['pat_consult_id' => $pat_consult_id])->one();
                $model->delete();
            }
        }
    }

    private function _setConsultId() {
        if (is_array($this->proc_consultant_ids))
            $this->proc_consultant_ids = Json::encode($this->proc_consultant_ids);
    }

    public function fields() {
        $extend = [
            'encounter' => function ($model) {
                return isset($model->encounter) ? $model->encounter : '-';
            },
            'procedure_name' => function ($model) {
                return isset($model->chargeCat) ? $model->chargeCat->charge_subcat_name : '-';
            },
            'doctors' => function ($model) {
                if (isset($this->proc_consultant_ids) && is_array($this->proc_consultant_ids)) {
                    $ids = implode(',', $this->proc_consultant_ids);

                    $query = "SELECT GROUP_CONCAT(concat(title_code,name) SEPARATOR ', ') as doctors ";
                    $query .= "From co_user ";
                    $query .= "Where find_in_set(user_id, '$ids') > 0 ";

                    $command = Yii::$app->client->createCommand($query);
                    $data = $command->queryAll();
                    return $data[0]['doctors'];
                }
            },
            'encounter_status' => function ($model) {
                return $model->encounter->isActiveEncounter();
            },
            'short_description' => function ($model) {
                if (isset($model->proc_description)) {
                    if (strlen($model->proc_description) > 40) {
                        $description = substr($model->proc_description, 0, 40) . '...';
                    } else {
                        $description = $model->proc_description;
                    }
                    return $description;
                } else {
                    return '-';
                }
            },
            'full_description' => function ($model) {
                return nl2br($model->proc_description);
            },
            'concatenate_description' => function ($model) {
                if (isset($model->proc_description)) {
                    if (strlen($model->proc_description) > 40) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
            'patient_name' => function ($model) {
                return (isset($model->patient) ? $model->patient->fullname : '-');
            },
            'patient_UHID' => function ($model) {
                return isset($model->patient) ? $model->patient->patient_global_int_code : '-';
            },
        ];

        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'procedurelist':
                    $addt_keys = ['procedure_name', 'doctors', 'encounter_id', 'encounter_status', 'short_description', 'full_description', 'concatenate_description', 'branch_name'];
                    $parent_fields = [
                        'tenant_id' => 'tenant_id',
                        'proc_id' => 'proc_id',
                        'proc_description' => 'proc_description',
                        'proc_date' => 'proc_date',
                        'encounter_id' => 'encounter_id'
                    ];
                    break;
                case 'billing':
                    $addt_keys = ['procedure_name'];
                    $parent_fields = [
                        'proc_id' => 'proc_id',
                        'charge_amount' => 'charge_amount',
                    ];
                    break;
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function afterFind() {
        if (is_string($this->proc_consultant_ids))
            $this->proc_consultant_ids = Json::decode($this->proc_consultant_ids);

        return parent::afterFind();
    }

}
