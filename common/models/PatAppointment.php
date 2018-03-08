<?php

namespace common\models;

use common\models\query\PatAppointmentQuery;
use DateTime;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_appointment".
 *
 * @property integer $appt_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property integer $encounter_id
 * @property string $status_date
 * @property string $status_time
 * @property integer $consultant_id
 * @property string $appt_status
 * @property string $status
 * @property string $amount
 * @property string $notes
 * @property integer $patient_cat_id
 * @property string $patient_bill_type
 * @property string $payment_mode
 * @property string $card_type
 * @property integer $card_number
 * @property string $bank_name
 * @property string $bank_number
 * @property string $bank_date
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoUser $consultant
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatAppointment extends RActiveRecord {

    public $consultant_perday_appt_count;
    public $tenant_name;
    public $full_consultant_name;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_appointment';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['status_date', 'status_time', 'consultant_id', 'appt_status', 'patient_id'], 'required'],
                [['patient_cat_id', 'amount', 'payment_mode'], 'required', 'on' => 'seen_status'],
                [['tenant_id', 'patient_id', 'encounter_id', 'consultant_id', 'created_by', 'modified_by'], 'integer'],
                [['status_date', 'status_time', 'amount', 'notes', 'patient_cat_id', 'created_at', 'modified_at', 'deleted_at', 'patient_bill_type', 'card_type', 'card_number', 'bank_name', 'bank_number', 'bank_date', 'ref_no'], 'safe'],
                [['status', 'patient_bill_type'], 'string'],
                [['appt_status'], 'string', 'max' => 1],
                [['appt_status'], 'unique', 'targetAttribute' => ['tenant_id', 'patient_id', 'encounter_id', 'appt_status'], 'message' => 'The combination has already been taken.'],
                [['payment_mode', 'status'], 'string'],
                [['card_type', 'card_number'], 'required', 'when' => function($model) {
                    return ($model->payment_mode == 'CD' && $model->appt_status == 'S');
                }],
                [['bank_name', 'bank_number', 'bank_date'], 'required', 'when' => function($model) {
                    return ($model->payment_mode == 'CH' && $model->appt_status == 'S');
                }],
                [['bank_name', 'ref_no', 'bank_date'], 'required', 'when' => function($model) {
                    return ($model->payment_mode == 'ON' && $model->appt_status == 'S');
                }],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'appt_id' => 'Appt',
            'tenant_id' => 'Tenant',
            'patient_id' => 'Patient',
            'encounter_id' => 'Encounter',
            'status_date' => 'Status Date',
            'status_time' => 'Status Time',
            'consultant_id' => 'Consultant',
            'appt_status' => 'Appt Status',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
            'patient_cat_id' => 'Patient category',
            'amount' => 'Amount',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getConsultant() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'consultant_id']);
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

    public function beforeValidate() {
        $this->setCurrentData();
        return parent::beforeValidate();
    }

    public function beforeSave($insert) {
        if (!empty($this->status_time))
            $this->status_time = date('H:i:s', strtotime($this->status_time));

        if (!empty($this->status_date))
            $this->status_date = date('Y-m-d', strtotime($this->status_date));

        if ($insert) {
            $this->setCurrentData();
        } else {
            $old_amount = $this->getOldAttribute('amount');
            $new_amount = $this->amount;
            if ($old_amount != $new_amount) {
                $activity = 'Fees Changed Successfully (#' . $old_amount . ' changed to ' . $new_amount . ') (#' . $this->encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatAppointment::tableName(), $this->appt_id, $activity);
            }
        }

        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            //Close Encounter
            if ($this->appt_status == 'S' || $this->appt_status == 'C') {
                $this->encounter->status = '0';
                if ($this->appt_status == 'S') {
                    $this->encounter->bill_no = CoInternalCode::generateInternalCode('B', 'common\models\PatEncounter', 'bill_no');
                }
                $this->encounter->save(false);

                if ($this->appt_status == 'C') {
                    PatAppointment::updateAll(['status' => '0'], 'encounter_id = ' . $this->encounter->encounter_id . ' AND status = "1"');
                }
            }
            $this->_insertTimeline();
            $this->_insertAuditlog();
        }
        return parent::afterSave($insert, $changedAttributes);
    }

    private function _insertAuditlog() {
        if ($this->appt_status == 'B')
            $activity = 'Patient Booked Successfully (#' . $this->encounter_id . ' )';
        else if ($this->appt_status == 'S')
            $activity = 'Patient Seen Successfully (#' . $this->encounter_id . ' )';
        else if ($this->appt_status == 'A')
            $activity = 'Patient Arrived Successfully (#' . $this->encounter_id . ' )';
        else
            $activity = 'Patient Appointment Cancelled Successfully (#' . $this->encounter_id . ' )';
        CoAuditLog::insertAuditLog(PatAppointment::tableName(), $this->appt_id, $activity);
    }

    private function _insertTimeline() {
        $header_sub = "Encounter # {$this->encounter_id}";
        $consultant = "<br />Consultant : <b>{$this->consultant->title_code} {$this->consultant->name}</b>";

        switch ($this->appt_status) {
            case 'B':
                $header = "Appoinment Booked";
                $message = "Appoinment Booked. $consultant";
                break;
            case 'A':
                $header = "Patient Arrived";
                $message = "Patient Arrived. $consultant";
                break;
            case 'S':
                $header = "Doctor Seen";
                $message = "Seen by Consultant. $consultant";
                break;
            case 'C':
                $header = "Appointment Cancel";
                $message = "Appointment Cancelled. $consultant";
                break;
        }
        PatTimeline::insertTimeLine($this->patient_id, $this->status_date . ' ' . $this->status_time, $header, $header_sub, $message, 'ENCOUNTER', $this->encounter_id);
    }

    public function setCurrentData() {
        if (isset($this) && isset($this->encounter) && isset($this->encounter->patLiveAppointmentBooking))
            $this->consultant_id = $this->encounter->patLiveAppointmentBooking->consultant_id;
    }

    public function fields() {
        $extend = [
            'status_datetime' => function ($model) {
                return $model->status_datetime;
            },
            'waiting_elapsed' => function ($model) {
                return $model->waiting_elapsed;
            },
            'waiting_elapsed_time' => function ($model) {
                return $model->waiting_elapsed_time;
            },
            'consultant_name' => function ($model) {
                if (isset($model->consultant))
                    return $model->consultant->title_code . $model->consultant->name;
                else
                    return '-';
            },
            'consultant_perday_appt_count' => function ($model) {
                return isset($model->consultant_perday_appt_count) ? $model->consultant_perday_appt_count : '-';
            },
            'patient_name' => function ($model) {
                return $model->patient_name;
            },
            'patient_mobile' => function ($model) {
                return $model->patient_mobile;
            },
            'patient_guid' => function ($model) {
                if (isset($model->patient))
                    return $model->patient->patient_guid;
                else
                    return '-';
            },
            'patient_uhid' => function ($model) {
                if (isset($model->patient))
                    return $model->patient_uhid;
                else
                    return '-';
            },
            'branch_name' => function ($model) {
                return isset($model->tenant) ? $model->tenant->tenant_name : '-';
            }
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function getPatient_name() {
        if (isset($this->patient))
            return $this->patient->patient_title_code . $this->patient->patient_firstname;
        else
            return '-';
    }

    public function getPatient_mobile() {
        if (isset($this->patient))
            return $this->patient->patient_mobile;
        else
            return '-';
    }

    public function getPatient_uhid() {
        if (isset($this->patient))
            return $this->patient->patient_global_int_code;
        else
            return '-';
    }

    public function getStatus_datetime() {
        return "{$this->status_date} {$this->status_time}";
    }

    public function getWaiting_elapsed() {
        $date = date('Y-m-d', strtotime($this->status_date)) . ' ' . date('H:i:s', strtotime($this->status_time));

        $start_date = new DateTime($date);
//                $since_start = $start_date->diff(new DateTime(date('Y-m-d H:i:s')));

        $default_elapsed_time = 3600; //One Hour
        $get_elapsed_time = AppConfiguration::getConfigurationByCode('ET');
        if (isset($get_elapsed_time))
            $default_elapsed_time = $get_elapsed_time->value;

//                $default_elapsed_time = 60; //One Min
        $now = new DateTime('now');
        $diff_seconds = $now->getTimestamp() - $start_date->getTimestamp();

        return ($diff_seconds >= $default_elapsed_time);
    }

    public function getWaiting_elapsed_time() {
        $date = date('Y-m-d', strtotime($this->status_date)) . ' ' . date('H:i:s', strtotime($this->status_time));

        $start_date = new DateTime($date);
//                $since_start = $start_date->diff(new DateTime(date('Y-m-d H:i:s')));

        $default_elapsed_time = 3600; //One Hour
        $get_elapsed_time = AppConfiguration::getConfigurationByCode('ET');
        if (isset($get_elapsed_time))
            $default_elapsed_time = $get_elapsed_time->value;

//                $default_elapsed_time = 60; //One Min
        $now = new DateTime('now');
        $diff_seconds = $now->getTimestamp() - $start_date->getTimestamp();

        if ($diff_seconds >= $default_elapsed_time) {
            $hours = floor($diff_seconds / 3600);
            $minutes = floor(($diff_seconds / 60) % 60);
            $seconds = $diff_seconds % 60;

            if ($hours > 0)
                return "$hours hr, $minutes mins";
            else if ($minutes > 0)
                return "$minutes mins";
            else if ($seconds > 0)
                return "$seconds sec";
            else
                return false;
        }

        return false;
    }

    public static function find() {
        return new PatAppointmentQuery(get_called_class());
    }

    public static function checkAvailableSlot($consultant_id, $schedule_date, $schedule_time) {
        $is_available = self::find()->joinWith('encounter')->where(['status_date' => $schedule_date, 'status_time' => $schedule_time, 'consultant_id' => $consultant_id, 'appt_status' => 'B', 'pat_encounter.status' => '1'])->count();
        return ($is_available == 0 ? true : false);
    }

    //New Function instead of above one
    public static function checkBookedSlots($consultant_id, $schedule_date) {
        $booked_slots = self::find()->joinWith('encounter')->where(['status_date' => $schedule_date, 'consultant_id' => $consultant_id, 'appt_status' => 'B', 'pat_encounter.status' => '1'])->orderBy('status_time')->all();
        return \yii\helpers\ArrayHelper::map($booked_slots, 'status_time', 'status_time');
    }

    public static function getFutureAppointments() {
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $future_appointments = self::find()
                ->joinWith('encounter')
                ->where(['>', 'status_date', date("Y-m-d")])
                ->andWhere([
                    'appt_status' => 'B',
                    'pat_encounter.status' => '1',
                    'pat_encounter.tenant_id' => $tenant_id
                ])
                ->addSelect(["*", 'COUNT(*) AS consultant_perday_appt_count'])
                ->groupBy(['consultant_id', 'status_date'])
                ->all();
        return $future_appointments;
    }

}
