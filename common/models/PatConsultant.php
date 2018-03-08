<?php

namespace common\models;

use common\models\query\PatConsultantQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_consultant".
 *
 * @property integer $pat_consult_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $consultant_id
 * @property string $consult_date
 * @property string $notes
 * @property string $status
 * @property string $charge_amount
 * @property integer $proc_id
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 * @property CoUser $consultant
 */
class PatConsultant extends RActiveRecord {

    public $report_consultant_name;
    public $report_patient_name;
    public $report_patient_global_int_code;
    public $report_total_visit;
    public $report_total_charge_amount;
    public $branch_name;
    public $grouped_encounter_ids;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_consultant';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['encounter_id', 'patient_id', 'consultant_id'], 'required'],
                [['tenant_id', 'encounter_id', 'patient_id', 'consultant_id', 'created_by', 'modified_by', 'privacy'], 'integer'],
                [['consult_date', 'created_at', 'modified_at', 'deleted_at', 'proc_id', 'charge_amount'], 'safe'],
                [['notes', 'status'], 'string'],
                [['consult_date'], 'validateConsultant'],
        ];
    }

    public function validateConsultant($attribute, $params) {
        $encounter = PatEncounter::find()
                ->where([
                    'pat_encounter.encounter_id' => $this->encounter_id,
                ])
                ->one();
        $encounter_date = date('Y-m-d', strtotime($encounter->encounter_date));
        if (date('Y-m-d', strtotime($this->consult_date)) < $encounter_date) {
            $this->addError($attribute, "Consultant Visit Date must be greater than the Admission date( {$encounter_date} )");
        }

        $discharge = PatAdmission::find()
                ->where([
                    'pat_admission.encounter_id' => $this->encounter_id,
                ])
                ->andWhere(['admission_status' => 'CD'])
                ->one();
        if (!empty($discharge)) {
            $discharge_date = new \DateTime($discharge->status_date);
            $consult_date = new \DateTime($this->consult_date);
            if ($discharge_date <= $consult_date) {
                $this->addError($attribute, "Consultant Visit Date must be less than the Discharge date( {$discharge->status_date} )");
            }
        }

//        if ($this->isNewRecord && isset(Yii::$app->user->identity->user->tenant_id) && Yii::$app->user->identity->user->tenant_id != 0) {
//            $current_date = date('Y-m-d');
//            $upto_date = date('Y-m-d', strtotime($current_date . "+3 days"));
//
//            if ($upto_date < date('Y-m-d', strtotime($this->consult_date)))
//                $this->addError($attribute, "Consultant Date must be lesser than {$upto_date}");
//            else if (date('Y-m-d', strtotime($this->consult_date)) < $current_date)
//                $this->addError($attribute, "Consultant Date must be greater than {$current_date}");
//        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'pat_consult_id' => 'Pat Consult ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'consultant_id' => 'Consultant',
            'consult_date' => 'Consult Date',
            'notes' => 'Notes',
            'privacy' => 'Privacy',
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
    public function getConsultant() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'consultant_id']);
    }
    
    public function getAdmission() {
        return $this->hasMany(PatAdmission::className(), ['encounter_id' => 'encounter_id']);
    }

    public static function find() {
        return new PatConsultantQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'short_notes' => function ($model) {
                if (isset($model->notes)) {
                    if (strlen($model->notes) > 40) {
                        $notes = substr($model->notes, 0, 40) . '...';
                    } else {
                        $notes = $model->notes;
                    }
                    return $notes;
                } else {
                    return '-';
                }
            },
            'full_notes' => function ($model) {
                return nl2br($model->notes);
            },
            'concatenate_notes' => function ($model) {
                if (isset($model->notes)) {
                    if (strlen($model->notes) > 40) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return false;
                }
            },
            'consultant_name' => function ($model) {
                $specname = isset($model->consultant->speciality) ? " ( " . $model->consultant->speciality->speciality_name . " )" : "";
                return (isset($model->consultant->name)) ? $model->consultant->title_code . $model->consultant->name . $specname : '-';
            },
            'encounter_status' => function ($model) {
                if($model->encounter) {
                    return $model->encounter->isActiveEncounter();
                } else {
                    return '';
                }
            },
            'branch_name' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
            'created_by_name' => function ($model) {
                return (isset($model->createdUser) ? $model->createdUser->name : '-');
            },
            'patient_name' => function ($model) {
                return (isset($model->patient) ? $model->patient->fullname : '-');
            },
            'patient_UHID' => function ($model) {
                return isset($model->patient) ? $model->patient->patient_global_int_code : '-';
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function beforeSave($insert) {
        $encounter_type = $this->encounter->encounter_type;
        $link_id = $this->patient->patient_category_id;

        if ($encounter_type == 'IP')
            $link_id = $this->encounter->patCurrentAdmission->room_type_id;

        $this->charge_amount = CoChargePerCategory::getChargeAmount(-1, 'P', $this->consultant_id, $encounter_type, $link_id);
        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        $consultant = "Consultant : <b>{$this->consultant->title_code} {$this->consultant->name}</b>";
        if ($insert) {
            $message = $this->notes != '' ? "{$this->notes} <br /> $consultant" : $consultant;
            $activity = 'Consultant Added Successfully (#' . $this->encounter_id . ' )';
        } else {
            $message = $this->notes != '' ? "Updated: {$this->notes} <br /> $consultant" : "Updated: $consultant";
            $activity = 'Consultant Updated Successfully (#' . $this->encounter_id . ' )';
        }
        PatTimeline::insertTimeLine($this->patient_id, $this->consult_date, 'Consultation', '', $message, 'CONSULTANT', $this->encounter_id);
        CoAuditLog::insertAuditLog(PatConsultant::tableName(), $this->pat_consult_id, $activity);

        return parent::afterSave($insert, $changedAttributes);
    }

}
