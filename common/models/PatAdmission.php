<?php

namespace common\models;

use common\models\query\PatAdmissionQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_admission".
 *
 * @property integer $admn_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property integer $encounter_id
 * @property string $status_date
 * @property integer $consultant_id
 * @property integer $floor_id
 * @property integer $ward_id
 * @property integer $room_id
 * @property integer $room_type_id
 * @property string $admission_status
 * @property integer $is_swap
 * @property string $discharge_type
 * @property string $status
 * @property string $notes
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
class PatAdmission extends RActiveRecord {

    public $vacantOldRoomId = null;
    public $isSwapping = false;
    public $swapEncounterId;
    public $swapFloorId;
    public $swapWardId;
    public $swapPatientId;
    public $swapRoom;
    public $swapRoomId;
    public $swapRoomTypeId;
    public $type_of_transfer;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_admission';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['consultant_id', 'floor_id', 'ward_id', 'room_id', 'room_type_id', 'status_date'], 'required'],
                [['swapPatientId', 'swapRoomId', 'swapRoomTypeId'], 'required', 'on' => 'swap'],
                [['tenant_id', 'patient_id', 'encounter_id', 'consultant_id', 'floor_id', 'ward_id', 'room_id', 'room_type_id', 'created_by', 'modified_by'], 'integer'],
                [['status_date', 'created_at', 'modified_at', 'deleted_at', 'status_date', 'admission_status', 'is_swap', 'discharge_type', 'type_of_transfer'], 'safe'],
                [['status', 'notes'], 'string'],
                ['admission_status', 'validateAdmissionStatus'],
                ['status_date', 'validateStatusDate'],
                ['room_type_id', 'checkRoomChargeItems'],
        ];
    }

    public function checkRoomChargeItems($attribute, $params) {
        if (!empty($this->room_type_id)) {
            $room_charges = Yii::$app->hepler->getRoomChargeItems($this->tenant_id, $this->room_type_id);
            if (empty($room_charges)) {
                $this->addError($attribute, "Room charges not setup in configuration menu, Unable to initiate admission");
            }
        }
    }

    public function validateAdmissionStatus($attribute, $params) {
        //$this->addError($attribute, $this->encounter->current_tenant_id . "Branch can't be same. Change the Consultant" . $this->tenant_id);
        if ($this->admission_status == 'A') {
            return true;
        }

        $current_admission = $this->encounter->patCurrentAdmission;

        if ($this->admission_status == 'TR' && !$this->isSwapping) {
            if ($current_admission->room_id == $this->room_id && $current_admission->room_type_id == $this->room_type_id) {
                $this->addError($attribute, "Room / Room Type can't be same. Change the Room / Room Type");
            }
        } else if ($this->admission_status == 'TD') {
            if ($current_admission->consultant_id == $this->consultant_id) {
                $this->addError($attribute, "Consultant can't be same. Change the Consultant");
            }
        } else if ($this->admission_status == 'TB') {
            $current_tenant = $this->encounter->current_tenant_id;
            if ($current_tenant == $this->tenant_id) {
                $this->addError($attribute, "Branch can't be same. Change the Branch");
            }
        }
    }

    public function validateStatusDate($attribute, $params) {
        if ($this->isNewRecord) {
            if (!empty($this->admission_status)) {
                if ($this->admission_status != 'A') {
                    $current_admission = $this->encounter->patCurrentAdmission;
                    if ($current_admission->status_date > $this->status_date) {
                        $this->addError($attribute, "Date must be greater than {$current_admission->status_date}");
                    }
                    if ($this->admission_status == 'CD') {
                        $statusdateError = '';
                        $consultant = PatConsultant::find()
                                ->where(['pat_consultant.encounter_id' => $this->encounter_id])
                                ->andWhere(['>=', 'pat_consultant.consult_date', $this->status_date])
                                ->active()
                                ->one();
                        if (!empty($consultant))
                            $statusdateError = "Discharge Date must be greater the Consultant Visit date( {$consultant->consult_date} )";

                        if (empty($consultant)) {
                            $procedure = PatProcedure::find()
                                    ->where(['pat_procedure.encounter_id' => $this->encounter_id])
                                    ->andWhere(['>=', 'pat_procedure.proc_date', $this->status_date])
                                    ->active()
                                    ->one();
                            if (!empty($procedure))
                                $statusdateError = "Discharge Date must be greater than the Procedure date( {$procedure->proc_date} )";
                        }

                        if (!empty($statusdateError))
                            $this->addError($attribute, $statusdateError);
                    }
                } else if ($this->admission_status == 'A') {
                    if (date('Y-m-d', strtotime($this->status_date)) > date('Y-m-d'))
                        $this->addError($attribute, "Date must be lesser than " . date('d-m-Y'));
                }
            }
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'admn_id' => 'Admn ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'encounter_id' => 'Encounter ID',
            'status_date' => 'Admission Date',
            'consultant_id' => 'Consultant',
            'floor_id' => 'Floor',
            'ward_id' => 'Ward',
            'room_id' => 'Room',
            'room_type_id' => 'Room Type',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
            'swapPatientId' => 'Patient',
            'swapRoomId' => 'Room',
            'swapRoomTypeId' => 'Room Type'
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

    public function getConsultant() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'consultant_id']);
    }

    public function getFloor() {
        return $this->hasOne(CoFloor::className(), ['floor_id' => 'floor_id']);
    }

    public function getWard() {
        return $this->hasOne(CoWard::className(), ['ward_id' => 'ward_id']);
    }

    public function getRoom() {
        return $this->hasOne(CoRoom::className(), ['room_id' => 'room_id']);
    }

    public function getRoomType() {
        return $this->hasOne(CoRoomType::className(), ['room_type_id' => 'room_type_id']);
    }

    public static function find() {
        return new PatAdmissionQuery(get_called_class());
    }

    public function beforeValidate() {
        $this->setCurrentData();
        return parent::beforeValidate();
    }

    public function beforeSave($insert) {
        if (!empty($this->status_date))
            $this->status_date = date('Y-m-d H:i:s', strtotime($this->status_date));

        if ($insert) {
            $this->setCurrentData();

            //Encounter transfer to anthor branch check patient_id in particular branch and insert
            if ($this->admission_status == 'TB') {
                $patient_details = PatPatient::find()->where(['patient_global_guid' => $this->patient->patient_global_guid, 'tenant_id' => $this->tenant_id])->one();
                if (!empty($patient_details)) {
                    //$this->encounter->patient_id = $patient_details->patient_id;
                    $this->patient_id = $patient_details->patient_id;
                } else {
                    $newpatient = \IRISORG\modules\v1\controllers\PatientController::Addnewpatient($this->patient->patient_global_guid, $this->tenant_id);
                    //$this->encounter->patient_id = $newpatient['patient']->patient_id;
                    $this->patient_id = $newpatient['patient']->patient_id;
                }
                //$this->encounter->current_tenant_id = $this->tenant_id;
                //$this->encounter->save(false);
            }

            //Set Old room status to vacant
            if (($this->admission_status == 'TR' || $this->admission_status == 'D' || $this->admission_status == 'AC' || $this->admission_status == 'TB') && !$this->isSwapping && (!isset($this->type_of_transfer) || $this->type_of_transfer != 'TRT')) {
                $this->vacantOldRoomId = $this->encounter->patCurrentAdmission->room_id;
            }
        } else {
            //Modify Admission
            if ($this->admission_status == 'A') {
                //Vacant Old room
                if ($this->encounter->patCurrentAdmission->room_id != $this->room_id)
                    $this->vacantOldRoomId = $this->encounter->patCurrentAdmission->room_id;
            }
        }
        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        //Change room occupied status
        if ($this->room_id) {
            $room = CoRoom::find()->where(['room_id' => $this->room_id])->one();
            $room->occupied_status = 1;
            $room->save(false);
        }

        if ($insert) {
            //Close Encounter when Admission cancel
            if ($this->admission_status == 'AC') {
                $this->encounter->status = '0';
                $this->encounter->save(false);
            }
            if ($this->admission_status == 'TB') {
                $this->encounter->current_tenant_id = $this->tenant_id;
                $this->encounter->patient_id = $this->patient_id;
                $this->encounter->save(false);
            }
        }

        //Change Old room status to vacant if Room Transfer
        if (!is_null($this->vacantOldRoomId)) {
            $room = CoRoom::find()->where(['room_id' => $this->vacantOldRoomId])->one();

            if ($this->admission_status == 'D') {
                $room->occupied_status = 2; // Maintanance Mode
                $room->notes = 'Room under maintanance'; // Maintanance Mode
            } else {
                $room->occupied_status = 0; // Vacant Mode
            }
            $room->save(false);
            $this->vacantOldRoomId = null;
        }

        $this->_insertTimeline($insert);

        switch ($this->admission_status) {
            case 'A':
                if ($insert)
                    Yii::$app->hepler->addRecurring($this);
                else
                    Yii::$app->hepler->cancelRecurring($this);
                break;
            case 'TB':
                Yii::$app->hepler->transferRecurring($this);
                break;
            case 'TR':
                Yii::$app->hepler->transferRecurring($this);
                break;
            case 'C':
                Yii::$app->hepler->cancelRecurring($this);
                break;
        }
        if ($this->admission_status == 'A')
            $activity = 'Patient Admission Successfully (#' . $this->encounter_id . ' )';
        else if ($this->admission_status == 'D')
            $activity = 'Patient Discharge Successfully (#' . $this->encounter_id . ' )';
        else if ($this->admission_status == 'TD')
            $activity = 'Patient Transfer Doctor Successfully (#' . $this->encounter_id . ' )';
        else if ($this->admission_status == 'TR')
            $activity = 'Patient Transfer Room Successfully (#' . $this->encounter_id . ' )';
        else if ($this->admission_status == 'C')
            $activity = 'Patient Room Swapping  Cancelled Successfully (#' . $this->encounter_id . ' )';
        else if ($this->admission_status == 'CD')
            $activity = 'Patient Clinical Discharge Successfully (#' . $this->encounter_id . ' )';
        else if ($this->admission_status == 'TB')
            $activity = 'Patient Transfer Branch Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Patient Admission Cancelled Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatConsultant::tableName(), $this->admn_id, $activity);

        return parent::afterSave($insert, $changedAttributes);
    }

    private function _insertTimeline($insert) {
        $header_sub = "Encounter # {$this->encounter_id}";
        $bed_details = "<br /> Bed No: <b>{$this->room->bed_name} ({$this->roomType->room_type_name})</b>";

        switch ($this->admission_status) {
            case 'A':
                $header = "Patient Admission";
                $message = $insert ? "Patient Admitted. $bed_details" : "Patient Admission Modified. $bed_details";
                break;
            case 'TR':
                $header = "Room Transfer";
                $message = "Patient Room Transfered. $bed_details";
                break;
            case 'TD':
                $header = "Doctor Transfer";
                $message = "Patient's Doctor Transfered. <br />Consultant Incharge: {$this->consultant->title_code} {$this->consultant->name}";
                break;
            case 'TB':
                $header = "Branch Transfer";
                $message = "Patient's Branch Transfered. <br />Branch Name: {$this->tenant->tenant_name}: Patient Admission Modified. $bed_details";
                break;
            case 'CD':
                $header = "Clinical Discharge";
                $message = "Patient Clinical Discharged. $bed_details";
                break;
            case 'D':
                $header = "Administrative Discharge";
                $message = "Patient Administrative Discharged. $bed_details";
                break;
            case 'C':
                $header = "Cancellation";
                $message = $this->notes;
                break;
            case 'AC':
                $header = "Admission Cancel";
                $message = $this->notes;
                break;
        }
        PatTimeline::insertTimeLine($this->patient_id, $this->status_date, $header, $header_sub, $message, 'ENCOUNTER', $this->encounter_id);
    }

    public function setCurrentData() {
        if ($this->admission_status == 'TD' || $this->admission_status == 'D' || $this->admission_status == 'CD' || $this->admission_status == 'AC') {
            $this->floor_id = $this->encounter->patCurrentAdmission->floor_id;
            $this->ward_id = $this->encounter->patCurrentAdmission->ward_id;
            $this->room_id = $this->encounter->patCurrentAdmission->room_id;
            $this->room_type_id = $this->encounter->patCurrentAdmission->room_type_id;

            if ($this->admission_status == 'D' || $this->admission_status == 'CD' || $this->admission_status == 'AC') {
                $this->consultant_id = $this->encounter->patCurrentAdmission->consultant_id;
            }
        } else if ($this->admission_status == 'TR' || $this->admission_status == 'TB') {
            $this->consultant_id = $this->encounter->patCurrentAdmission->consultant_id;
        }
    }

    public function fields() {
        $extend = [
            'room' => function ($model) {
                return (isset($model->room) ? $model->room : '-');
            },
            'room_details' => function ($model) {
                return $model->roomdetails;
            },
            'consultant_name' => function ($model) {
                $consultant = $model->consultant;
                return $consultant->title_code . $consultant->name;
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function getRoomdetails() {
        return "{$this->floor->floor_name} > {$this->ward->ward_name} > {$this->room->bed_name} ({$this->roomType->room_type_name})";
    }

}
