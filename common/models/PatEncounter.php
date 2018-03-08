<?php

namespace common\models;

use common\models\query\PatEncounterQuery;
use DateTime;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_encounter".
 *
 * @property integer $encounter_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property string $encounter_type
 * @property string $encounter_date
 * @property string $inactive_date
 * @property string $bill_no
 * @property string $bill_notes
 * @property integer $finalize
 * @property string $finalize_date
 * @property integer $authorize
 * @property integer $discharge
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property string $casesheet_no
 * @property string $concession_amount
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatAppointment[] $patAppointments
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatEncounter extends RActiveRecord {

    public $sts_date;
    public $sts_time;
    public $sts_status = 'A';
    public $add_casesheet_no = 'A';
    public $total_amount = '';
    public $op_doctor_payment_patient_name;
    public $op_doctor_payment_patient_global_int_code;
    public $op_doctor_payment_patient_mobile;
    public $op_doctor_payment_patient_id;
    public $op_doctor_payment_amount;
    public $op_doctor_payment_consultant_name;
    public $op_doctor_payment_seen_date;
    public $op_doctor_payment_seen_time;
    public $consultant_id;
    public $total_booking;
    public $seen_count;
    public $arrived_count;
    public $booked_count;
    public $branch_name;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_encounter';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['encounter_date'], 'required'],
                [['tenant_id', 'patient_id', 'finalize', 'authorize', 'created_by', 'modified_by', 'discharge'], 'integer'],
                [['encounter_date', 'current_tenant_id', 'inactive_date', 'created_at', 'modified_at', 'deleted_at', 'casesheet_no', 'discharge', 'total_amount', 'bill_no', 'bill_notes', 'consultant_id', 'total_booking', 'seen_count', 'arrived_count', 'booked_count', 'branch_name', 'finalize_date'], 'safe'],
                [['status', 'casesheet_no', 'add_casesheet_no'], 'string'],
                [['concession_amount'], 'number'],
                [['encounter_type'], 'string', 'max' => 5],
                ['concession_amount', 'validateConcessionAmount'],
                ['encounter_date', 'validateAdmissionDate'],
                ['encounter_date', 'validateAppointment'],
                ['encounter_date', 'validateOtherAdmission'],
        ];
    }

    public function validateConcessionAmount($attribute, $params) {
        if (($this->total_amount > 0) && $this->concession_amount > $this->total_amount)
            $this->addError($attribute, "Concession Amount ({$this->concession_amount}) must be lesser than Total Amount ({$this->total_amount})");
    }

    //Check new admission date is between old admission and discharge date.
    public function validateAdmissionDate($attribute, $params) {
        if ($this->encounter_type == 'IP') {
            $date = date("Y-m-d", strtotime($this->encounter_date));
            $result = PatEncounter::find()
                    ->joinWith('patAdmissions')
                    ->where([
                        'pat_encounter.tenant_id' => $this->tenant_id,
                        'pat_encounter.patient_id' => $this->patient_id,
                        'pat_encounter.status' => '0',
                        'pat_admission.admission_status' => 'D',
                    ])
                    ->encounterType($this->encounter_type)
                    ->andWhere("DATE(pat_encounter.encounter_date) <= '{$date}'")
                    ->andWhere("pat_admission.status_date >= '{$this->encounter_date}'")
                    ->one();

            if (!empty($result))
                $this->addError($attribute, "Admission already taken in this date. Kindly choose another date");
        }
    }

    //check admission takes place in any other tenant
    public function validateOtherAdmission($attribute, $params) {
        if ($this->encounter_type == 'IP') {
            $result = PatEncounter::find()
                    ->joinWith('patient')
                    ->where([
                        'pat_patient.patient_global_guid' => $this->patient->patient_global_guid,
                        'pat_encounter.status' => '1',
                    ])
                    ->andWhere(['<>', 'encounter_id', $this->encounter_id ?: ''])
                    ->encounterType($this->encounter_type)
                    ->one();

            if (!empty($result))
                $this->addError($attribute, "Patient already admitted in another branch of this organization");
//                $this->addError($attribute, "Admission already taken in {$result->tenant->tenant_name}");
        }
    }

    //Check new appointment - Same Tenant, Same Patient, Same Doctor, Active Encounter
    public function validateAppointment($attribute, $params) {
        if ($this->encounter_type == 'OP') {
            $date = date("Y-m-d", strtotime($this->encounter_date));
            $result = PatEncounter::find()
                    ->joinWith('patAppointments')
                    ->where([
                        'pat_encounter.tenant_id' => $this->tenant_id,
                        'pat_encounter.patient_id' => $this->patient_id,
                        'DATE(pat_encounter.encounter_date)' => $date,
                        'pat_encounter.status' => '1',
                        'pat_appointment.consultant_id' => $this->consultant_id,
                    ])
                    ->encounterType('OP')
                    ->one();

            if (!empty($result)) {
                $this->addError($attribute, 'Booking activity in progress for this patient!');
            }
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'encounter_id' => 'Encounter ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'encounter_type' => 'Encounter Type',
            'encounter_date' => 'Encounter Date',
            'inactive_date' => 'Inactive Date',
            'current_tenant_id' => 'current_tenant_id',
            'finalize' => 'Finalize',
            'authorize' => 'Authorize',
            'recurring_settlement' => 'Recurring Settlement',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
            'concession_amount' => 'Concession Amount',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getPatAppointments() {
        return $this->hasMany(PatAppointment::className(), ['encounter_id' => 'encounter_id']);
    }

    public function getPatAppointmentCancel() {
        return $this->hasOne(PatAppointment::className(), ['encounter_id' => 'encounter_id'])->andWhere(['IN', 'appt_status', ['C']])->orderBy(['created_at' => SORT_DESC]);
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

    public static function find() {
        return new PatEncounterQuery(get_called_class());
    }

    /**
     * @return ActiveQuery
     */
    public function getPatAdmissions() {
        return $this->hasMany(PatAdmission::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatLiveAdmission() {
        return $this->hasOne(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['admission_status' => 'A'])->orderBy(['status_date' => SORT_DESC]);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatLiveAppointmentBooking() {
        return $this->hasOne(PatAppointment::className(), ['encounter_id' => 'encounter_id'])->andWhere('appt_status = "B"')->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatLiveAppointmentArrival() {
        return $this->hasOne(PatAppointment::className(), ['encounter_id' => 'encounter_id'])->andWhere('appt_status = "A"')->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatAppointmentSeen() {
        return $this->hasOne(PatAppointment::className(), ['encounter_id' => 'encounter_id'])->andWhere('appt_status = "S"')->orderBy(['pat_appointment.created_at' => SORT_DESC]);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatCurrentAdmission() {
        return $this->hasOne(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['NOT IN', 'admission_status', ['C']])->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     *
     * @return type
     */
    public function getPatCurrentAdmissionExecptClinicalDischarge() {
        return $this->hasOne(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['NOT IN', 'admission_status', ['C', 'CD']])->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     *
     * @return type
     */
    public function getPatLastRoomAdmission() {
        return $this->hasMany(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['NOT IN', 'admission_status', ['C']])->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     *
     * @return type
     */
    public function getPatAdmissionDischarge() {
        return $this->hasOne(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['IN', 'admission_status', ['D', 'CD']])->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPatAdmissionClinicalDischarge() {
        return $this->hasOne(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['IN', 'admission_status', ['CD']])->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPatAdmissionCancel() {
        return $this->hasOne(PatAdmission::className(), ['encounter_id' => 'encounter_id'])->andWhere(['IN', 'admission_status', ['AC']])->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPatPrescriptions() {
        return $this->hasMany(PatPrescription::className(), ['encounter_id' => 'encounter_id'])->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPatVitals() {
        return $this->hasOne(PatVitals::className(), ['encounter_id' => 'encounter_id', 'patient_id' => 'patient_id'])->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPhaSales() {
        return $this->hasOne(PhaSale::className(), ['encounter_id' => 'encounter_id'])->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     *
     * @return type
     */
    public function fields() {
        $extend = [
            'branch_name' => function ($model) {
                return (isset($model->tenant->tenant_name) ? $model->tenant->tenant_name : '-');
            },
            'encounter_full_details' => function ($model) {
                return $this->getEncounterFulldetails($model);
            },
            'vital' => function ($model) {
                return (isset($model->patVitals) ? $model->patVitals : '-');
            },
            'patient' => function ($model) {
                return (isset($model->patient) ? $model->patient : '-');
            },
            'doe' => function ($model) {
                if (isset($model->encounter_date))
                    return date('d-M-Y', strtotime($model->encounter_date));
            },
            'doeTimeago' => function ($model) {
                if (isset($model->encounter_date))
                    return self::timeAgo(strtotime($model->encounter_date));
            },
            'liveAdmission' => function ($model) {
                return (isset($model->patLiveAdmission) ? $model->patLiveAdmission : '-');
            },
            'currentAdmission' => function ($model) {
                return (isset($model->patCurrentAdmission) ? $model->patCurrentAdmission : '-');
            },
            'liveAppointmentBooking' => function ($model) {
                return (isset($model->patLiveAppointmentBooking) ? $model->patLiveAppointmentBooking : '-');
            },
            'liveAppointmentArrival' => function ($model) {
                return (isset($model->patLiveAppointmentArrival) ? $model->patLiveAppointmentArrival : '-');
            },
            'appointmentSeen' => function ($model) {
                return (isset($model->patAppointmentSeen) ? $model->patAppointmentSeen : '-');
            },
            'appointmentSeen_amt_inwords' => function ($model) {
                return (isset($model->patAppointmentSeen) ? Yii::$app->hepler->convert_number_to_words((int) ($model->patAppointmentSeen->amount)) . ' Rupees Only' : '-');
            },
            'room_name' => function ($model) {
                return (isset($model->patCurrentAdmission->room->bed_name) ? (int) $model->patCurrentAdmission->room->bed_name : '-');
            },
            'liveAppointmentConsultant' => function ($model) {
                return (isset($model->patLiveAppointmentBooking->consultant) ? $model->patLiveAppointmentBooking->consultant : '-');
            },
            'room_type_name' => function ($model) {
                return (isset($model->patCurrentAdmission->roomType->room_type_name) ? $model->patCurrentAdmission->roomType->room_type_name : '-');
            },
            'floor_name' => function ($model) {
                return (isset($model->patCurrentAdmission->floor->floor_name) ? $model->patCurrentAdmission->floor->floor_name : '-');
            },
            'sts_date' => function ($model) {
                return $this->sts_date;
            },
            'sts_time' => function ($model) {
                return $this->sts_time;
            },
            'sts_status' => function ($model) {
                return !$this->sts_status;
            },
            'clinical_discharge_date' => function ($model) {
                if (!empty($model->patAdmissionClinicalDischarge))
                    return $model->patAdmissionClinicalDischarge->status_date;
            },
            'discharge_date' => function ($model) {
                if (!empty($model->patAdmissionDischarge)) {
                    if ($model->patAdmissionDischarge->admission_status == 'D') {
                        return $model->patAdmissionDischarge->status_date;
                    } else if ($model->patAdmissionDischarge->admission_status == 'CD') {
                        return $model->patAdmissionDischarge->status_date;
                    } else {
                        if ($model->finalize_date != '0000-00-00') {
                            return $model->finalize_date;
                        }
                    }
                }
            },
            'stay_duration' => function ($model) {
                if (!empty($model->patAdmissionDischarge))
                    $end_date = $model->patAdmissionDischarge->status_date;
                else
                    $end_date = date('Y-m-d');

                $date1 = new DateTime(date('Y-m-d', strtotime($model->encounter_date)));
                $date2 = new DateTime($end_date);

                return $date2->diff($date1)->format("%a") + 1;
            },
            'paid' => function ($model) {
                if ($model->encounter_type == 'IP') {
                    return $this->getAdvanceDetails();
                } elseif ($model->encounter_type == 'OP') {
                    if ($model->patAppointmentSeen) {
                        return $model->patAppointmentSeen->amount;
                    }
                }
                return 0;
            },
            'total_charge' => function ($model) {
                if ($model->encounter_type == 'IP') {
                    return $this->getTotalCharge();
                }
            },
            'viewChargeCalculation' => function ($model) {
                return $model->getViewChargeCalculation();
            },
            'balance' => function ($model) {
                if ($model->encounter_type == 'IP') {
                    $total = $this->getTotalCharge();
                    $paid = $this->getAdvanceDetails();
                    return ($total - $paid);
                }
                return 0;
            },
            'total_booking' => function ($model) {
                return $model->total_booking;
            },
            'seen_count' => function ($model) {
                return $model->seen_count;
            },
            'arrived_count' => function ($model) {
                return $model->arrived_count;
            },
            'booked_count' => function ($model) {
                return $model->booked_count;
            },
            'consultant_id' => function ($model) {
                return (isset($model->patLiveAppointmentBooking) ? $model->patLiveAppointmentBooking->consultant_id : '-');
            },
            'consultant_name' => function ($model) {
                return (isset($model->patLiveAppointmentBooking->consultant->fullname) ? $model->patLiveAppointmentBooking->consultant->fullname : '-');
            },
            'apptArrivalData' => function ($model) {
                if (isset($model->patLiveAppointmentArrival)):
                    return $model->patLiveAppointmentArrival->getAttributes([
                                'status_date',
                                'waiting_elapsed',
                                'waiting_elapsed_time',
                                'appt_status',
                                'status_datetime'
                    ]);
                else:
                    return '-';
                endif;
            },
            'apptSeenData' => function ($model) {
                if (isset($model->patAppointmentSeen)) {
                    return $model->patAppointmentSeen->getAttributes([
                                'status_datetime'
                    ]);
                } else {
                    return '-';
                }
            },
            'apptBookingData' => function ($model) {
                if (isset($model->patLiveAppointmentBooking)) {
                    return $model->patLiveAppointmentBooking->getAttributes([
                                'appt_id',
                                'status_datetime',
                                'status_date',
                                'status_time'
                    ]);
                } else {
                    return '-';
                }
            },
            'apptConsultantData' => function ($model) {
                if (isset($model->patLiveAppointmentBooking->consultant)) {
                    return $model->patLiveAppointmentBooking->consultant->getAttributes([
                                'fullname'
                    ]);
                } else {
                    return '-';
                }
            },
            'apptPatientData' => function ($model) {
                if (isset($model->patient)) {
                    return $model->patient->getAttributes([
                                'hasalert',
                                'incomplete_profile',
                                'new_user',
                                'patient_guid',
                                'patient_img_url',
                                'fullcurrentaddress',
                                'fullname',
                                'patient_age_ym',
                                'patient_global_int_code',
                                'patient_category',
                                'patient_category_fullname',
                                'patient_mobile',
                                'patient_id',
                                'current_room',
                                'patient_category_color'
                    ]);
                } else {
                    return '-';
                }
            },
            'encounter_status' => function ($model) {
                return $this->isActiveEncounter();
            },
            'cancel_appoitment' => function ($model) {
                return $this->isCancelappointEncounter();
            },
            'cancel_admission' => function ($model) {
                return $this->isCanceladmissionEncounter();
            },
            'searchEncData' => function ($model) {
                if (isset($model)) {
                    $isAppointment = $model->getPatLiveAppointmentBooking()->exists();
                    if ($isAdmission = $model->getPatLiveAdmission()->exists()) {
                        $admData = $model->patLiveAdmission;
                        $isAdmission = [
                            'floor_name' => $admData->floor->floor_name,
                            'room_name' => $admData->room->bed_name,
                            'room_type_name' => $admData->roomType->room_type_name,
                        ];
                    }
                    return [
                        'isAppointment' => $isAppointment,
                        'isAdmission' => $isAdmission
                    ];
                } else {
                    return '-';
                }
            },
        ];

        $parent_fields = parent::fields();
        $addt_keys = $extFields = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'oplist':
                    $addt_keys = ['consultant_id', 'apptArrivalData', 'apptSeenData', 'apptPatientData', 'apptBookingData'];
                    $parent_fields = [
                        'encounter_id' => 'encounter_id',
                        'patient_id' => 'patient_id',
                        'consultant_id' => 'consultant_id',
                        'created_at' => 'created_at'
                    ];
                    break;
                case 'advdetails':
                    $addt_keys = ['apptPatientData', 'stay_duration', 'viewChargeCalculation', 'total_charge', 'paid', 'balance'];
                    break;
                case 'search':
                    $addt_keys = ['searchEncData'];
                    $parent_fields = ['encounter_id' => 'encounter_id'];
                    break;
                case 'sale_encounter_id':
                    $addt_keys = ['cancel_appoitment', 'cancel_admission', 'encounter_full_details'];
                    $parent_fields = ['encounter_id' => 'encounter_id', 'encounter_type' => 'encounter_type'];
                    break;
                case 'encounter_details':
                    $addt_keys = false;
                    $parent_fields = ['encounter_id' => 'encounter_id',
                        'status' => 'status',
                        'encounter_type' => 'encounter_type'];
                    break;
                case 'prescription':
                    $addt_keys = ['liveAdmission', 'liveAppointmentBooking'];
                    break;
                case 'shortcut':
                    $addt_keys = ['apptPatientData'];
                    $parent_fields = [
                        'encounter_id' => 'encounter_id',
                        'status' => 'status',
                        'encounter_type' => 'encounter_type'];
                    break;
            endswitch;
        }

        if ($addt_keys !== false)
            $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;

        return array_merge($parent_fields, $extFields);
    }

    public function getTotalCharge() {
        $total_charge = 0;

        $total_charge += VBillingRecurring::find()
                ->where([
                    'encounter_id' => $this->encounter_id,
                    'tenant_id' => $this->tenant_id
                ])
                ->sum('total_charge');

        $total_charge += VBillingProcedures::find()
                ->where([
                    'encounter_id' => $this->encounter_id,
                    'tenant_id' => $this->tenant_id
                ])
                ->sum('total_charge');

        $total_charge += VBillingProfessionals::find()
                ->where([
                    'encounter_id' => $this->encounter_id,
                    'tenant_id' => $this->tenant_id
                ])
                ->sum('total_charge');

        $total_charge += VBillingOtherCharges::find()
                ->where([
                    'encounter_id' => $this->encounter_id,
                    'tenant_id' => $this->tenant_id
                ])
                ->sum('total_charge');

        return $total_charge;
    }

    public function getEncounterFulldetails($model) {
        return ucwords("{$this->encounter_id} [" . date('d/m/Y', strtotime($this->encounter_date)) . " | {$model->tenant->tenant_name}]");
    }

//            public function getTotalConcession() {
//                return $this->concession_amount + $this->OtherConcession;
//            }
//
//            public function getOtherConcession() {
//                $total_concession = 0;
//
//                $total_concession += VBillingProcedures::find()
//                        ->where([
//                            'encounter_id' => $this->encounter_id,
//                            'tenant_id' => $this->tenant_id
//                        ])
//                        ->sum('concession_amount');
//
//                $total_concession += VBillingProfessionals::find()
//                        ->where([
//                            'encounter_id' => $this->encounter_id,
//                            'tenant_id' => $this->tenant_id
//                        ])
//                        ->sum('concession_amount');
//
//                $total_concession += VBillingOtherCharges::find()
//                        ->where([
//                            'encounter_id' => $this->encounter_id,
//                            'tenant_id' => $this->tenant_id
//                        ])
//                        ->sum('concession_amount');
//
//                return $total_concession;
//            }

    public function getViewChargeCalculation() {
        $total_charge = $total_concession = $total_paid = $balance = 0;

        if ($this->encounter_type == 'IP') {
            $recurring = VBillingRecurring::find()
                            ->where([
                                'encounter_id' => $this->encounter_id,
                                //'tenant_id' => $this->tenant_id
                            ])
                            ->select('SUM(total_charge) as total_charge')->one();

            $procedure = VBillingProcedures::find()
                            ->where([
                                'encounter_id' => $this->encounter_id,
                                //'tenant_id' => $this->tenant_id
                            ])
                            ->select('SUM(total_charge) as total_charge, SUM(concession_amount) as concession_amount, SUM(extra_amount) as extra_amount')->one();

            $professional = VBillingProfessionals::find()
                            ->where([
                                'encounter_id' => $this->encounter_id,
                                //'tenant_id' => $this->tenant_id
                            ])
                            ->select('SUM(total_charge) as total_charge, SUM(concession_amount) as concession_amount, SUM(extra_amount) as extra_amount')->one();

            $other_charge = VBillingOtherCharges::find()
                            ->where([
                                'encounter_id' => $this->encounter_id,
                                //'tenant_id' => $this->tenant_id
                            ])
                            ->select('SUM(total_charge) as total_charge, SUM(concession_amount) as concession_amount, SUM(extra_amount) as extra_amount')->one();

            $total_paid = VBillingAdvanceCharges::find()
                    ->where([
                        'encounter_id' => $this->encounter_id,
                        //'tenant_id' => $this->tenant_id
                    ])
                    ->sum('total_charge');

            $sale_amount = PhaSale::find()
                    ->where([
                        'encounter_id' => $this->encounter_id,
//                        'tenant_id' => $this->tenant_id, //Hide by Nad, Because Sale may depends other tenant.
                            //'payment_type' => 'CR'
                    ])
                    //->andWhere(['!=', 'payment_status', 'C'])
                    ->all();
            $total_amount = $pending_amount = 0;
            foreach ($sale_amount as $sale) {
                $total_amount += $sale['bill_amount'];
                //$pending_amount += $sale['bill_amount'] - $sale->phaSaleBillingsTotalPaidAmount;
                $total_paid += $sale->phaSaleBillingsTotalPaidAmountPharmacySettlement;
            }

            $row_total_charge = $recurring->total_charge + $procedure->total_charge + $professional->total_charge + $other_charge->total_charge;
            $extra_charge = $procedure->extra_amount + $professional->extra_amount + $other_charge->extra_amount;
            $total_charge = $row_total_charge + $extra_charge + $total_amount;
            $total_concession = $this->concession_amount + $procedure->concession_amount + $professional->concession_amount + $other_charge->concession_amount;

            $balance = $total_charge - $total_concession - $total_paid;
        } elseif ($this->encounter_type == 'OP') {
            if ($this->patAppointmentSeen) {
                $total_paid = $this->patAppointmentSeen->amount;
            }
        }
        return compact('total_charge', 'total_concession', 'total_paid', 'balance');
    }

    public function getAdvanceDetails() {
        $amount = VBillingAdvanceCharges::find()
                ->where([
                    'encounter_id' => $this->encounter_id,
                    //'tenant_id' => $this->tenant_id
                ])
                ->sum('total_charge');

        return $amount;
    }

    public static function getEncounterListByPatient($tenant = null, $status = '1', $deleted = false, $patient_id = null, $encounter_type = 'IP,OP', $oldencounter, $limit) {
        if (!$deleted) {
            $list = self::find()->status($status)->active()->encounterType($encounter_type)->andWhere(['patient_id' => $patient_id]);
            if ($tenant) {
                $list->andWhere(['=', 'current_tenant_id', $tenant]);
            } else {
                $list->tenant($tenant);
            }
            if ($oldencounter != 'undefined') {
                $list->andWhere(['<=', 'DATE(encounter_date)', date('Y-m-d')]);
            }
            if ($limit != 'undefined') {
                $list->limit($limit);    //Prescription screen speedup, get only last encounter id.
            }
            $list = $list->orderBy(['encounter_id' => SORT_DESC])->all();
        } else
            $list = self::find()->tenant($tenant)->encounterType($encounter_type)->deleted()->andWhere(['patient_id' => $patient_id])->orderBy(['encounter_id' => SORT_DESC])->all();

        return $list;
    }

    public static function getEncounterListByTenantSamePatient($tenant = null, $status = '1', $deleted = false, $patient_id = null, $encounter_type = 'IP,OP', $oldencounter) {
        $patient = PatPatient::find()
                ->where(['patient_id' => $patient_id])
                ->one();

        $all_patient_id = PatPatient::find()
                ->select('GROUP_CONCAT(patient_id) AS allpatient')
                ->where(['patient_global_guid' => $patient->patient_global_guid])
                ->one();

        if (!$deleted) {
            $list = self::find()->where("patient_id IN ($all_patient_id->allpatient)")->status($status)->active()->encounterType($encounter_type);
            if ($oldencounter != 'undefined') {
                $list->andWhere(['<=', 'DATE(encounter_date)', date('Y-m-d')]);
            }
            $list = $list->orderBy(['encounter_id' => SORT_DESC])->all();
        } else
            $list = self::find()->where("patient_id IN ($all_patient_id->allpatient)")->encounterType($encounter_type)->deleted()->orderBy(['encounter_id' => SORT_DESC])->all();

        return $list;
    }

    public function beforeSave($insert) {
        if ($insert) {
            $this->current_tenant_id = $this->tenant_id;
            if (isset($this->patient->patActiveCasesheetno) && !empty($this->patient->patActiveCasesheetno)) {
                $this->casesheet_no = $this->patient->patActiveCasesheetno->casesheet_no;
            } else if (isset($this->add_casesheet_no) && !empty($this->add_casesheet_no)) {
                $model = new PatPatientCasesheet();

                $model->attributes = [
                    'casesheet_no' => $this->add_casesheet_no,
                    'patient_id' => $this->patient_id,
                    'start_date' => date("Y-m-d"),
                ];
                $model->save(false);
                $this->casesheet_no = $model->casesheet_no;
            }
        } else {
            $old_amount = $this->getOldAttribute('recurring_settlement');
            $new_amount = $this->recurring_settlement;
            if ($old_amount != $new_amount) {
                $activity = 'Recurring Settlement Added Successfully (#' . $old_amount . ' changed to ' . $new_amount . ') (#' . $this->encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatEncounter::tableName(), $this->encounter_id, $activity);
            }
            if ($this->encounter_type == 'IP' && $this->finalize != 0 && $this->bill_no == NULL)
                $this->bill_no = CoInternalCode::generateInternalCode('B', 'common\models\PatEncounter', 'bill_no');
        }

//        if($this->encounter_type == 'IP')
//            $this->status = $this->discharge == 0 ? '1' : '0';

        return parent::beforeSave($insert);
    }

    public function afterSave($insert, $changedAttributes) {
        if ($insert) {
            if ($this->encounter_type == 'IP')
                CoInternalCode::increaseInternalCode("B");
            $activity = 'Encounter Added Successfully (#' . $this->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatEncounter::tableName(), $this->encounter_id, $activity);
        } else {
            if (isset($changedAttributes['concession_amount']) && $changedAttributes['concession_amount'] != $this->concession_amount) {
                $amount = number_format($this->concession_amount, 2);
                $activity = "Concession amount {$amount}";
                if ($changedAttributes['concession_amount'] == '0.00') {
                    $activity .= ' ( Add )';
                    $message = 'Room Concession Added Successfully (#' . $this->encounter_id . ' )';
                } else {
                    $activity .= ' ( Edit )';
                    $message = 'Room Concession Updated Successfully (#' . $this->encounter_id . ' )';
                }
                PatBillingLog::insertBillingLog($this->patient_id, $this->encounter_id, $this->modified_at, 'R', 'Room Concession', $activity);
                CoAuditLog::insertAuditLog(PatEncounter::tableName(), $this->encounter_id, $message);
            }
        }

        if ($this->discharge != 0) {
            $model = new PatAdmission;
            $model->attributes = [
                'encounter_id' => $this->encounter_id,
                'patient_id' => $this->patient_id,
                'status_date' => date('Y-m-d H:i:s'),
                'admission_status' => 'D',
            ];
            $model->save(false);
        }

        return parent::afterSave($insert, $changedAttributes);
    }

    public function isActiveEncounter() {
        return ((empty($this->patAdmissionDischarge) && empty($this->patAdmissionCancel) && $this->encounter_type == 'IP') || $this->status == '1') ? 1 : 0;
    }

    public function isCancelappointEncounter() {
        return (empty($this->patAppointmentCancel) && $this->encounter_type == 'OP') ? false : true;
    }

    public function isCanceladmissionEncounter() {
        return (empty($this->patAdmissionCancel) && $this->encounter_type == 'IP') ? false : true;
    }

}
