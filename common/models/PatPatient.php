<?php

namespace common\models;

use common\components\HelperComponent;
use common\models\query\PatPatientQuery;
use p2made\helpers\Uuid\UuidHelpers;
use Yii;
use yii\db\ActiveQuery;
use yii\db\Connection;
use yii\helpers\ArrayHelper;
use common\models\PatAllergies;

/**
 * This is the model class for table "pat_patient".
 *
 * @property integer $patient_id
 * @property string $patient_global_guid
 * @property string $patient_guid
 * @property integer $casesheetno
 * @property string $patient_global_int_code
 * @property string $patient_int_code
 * @property integer $tenant_id
 * @property string $patient_reg_date
 * @property string $patient_title_code
 * @property string $patient_firstname
 * @property string $patient_lastname
 * @property string $patient_relation_code
 * @property string $patient_relation_name
 * @property integer $patient_care_taker
 * @property string $patient_care_taker_name
 * @property string $patient_dob
 * @property string $patient_gender
 * @property string $patient_marital_status
 * @property string $patient_occupation
 * @property string $patient_blood_group
 * @property integer $patient_category_id
 * @property string $patient_email
 * @property string $patient_reg_mode
 * @property string $patient_type
 * @property string $patient_ref_hospital
 * @property string $patient_ref_doctor
 * @property string $patient_ref_id
 * @property string $patient_mobile
 * @property string $patient_secondary_contact
 * @property string $patient_bill_type
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoTenant $tenant
 * @property PatPatientAddress[] $patPatientAddresses
 */
class PatPatient extends RActiveRecord {

    public $casesheetno;
    public $patient_global_int_code;
    public $patient_reg_date;
    public $patient_title_code;
    public $patient_firstname;
    public $patient_lastname;
    public $patient_relation_code;
    public $patient_relation_name;
    public $patient_care_taker;
    public $patient_care_taker_name;
    public $patient_dob;
    public $patient_gender;
    public $patient_marital_status;
    public $patient_occupation;
    public $patient_blood_group;
    public $patient_email;
    public $patient_reg_mode;
    public $patient_type;
    public $patient_ref_hospital;
    public $patient_ref_doctor;
    public $patient_ref_id;
    public $patient_mobile;
    public $patient_secondary_contact;
    public $patient_bill_type;
    public $patient_category_id;
    public $patient_image;
    public $parent_id;
    public $migration_created_by;
    public $_global_fields;
    public $allpatient;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        $current_database = Yii::$app->client->createCommand("SELECT DATABASE()")->queryScalar();
        return "$current_database.pat_patient";
    }

    public function init() {
        $global_fields = GlPatient::getTableSchema()->getColumnNames();
        $unset_fields = ['status', 'created_by', 'created_at', 'modified_by', 'modified_at', 'deleted_at', 'patient_id', 'patient_guid', 'tenant_id', 'patient_int_code'];
        $this->_global_fields = array_diff($global_fields, $unset_fields);
        return parent::init();
    }

//    public function init() {
//        parent::init();
//        if ($this->isNewRecord) {
//            $this->patient_int_code = CoInternalCode::find()->tenant()->codeType("P")->one()->Fullcode;
//        }
//    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['patient_title_code', 'patient_firstname', 'patient_gender', 'patient_reg_mode', 'patient_mobile'], 'required'],
                [['patient_category_id'], 'required', 'message' => 'Category cannot be blank.', 'on' => 'registration'],
                [['patient_dob'], 'validateDOB', 'on' => 'registration'],
                [['patient_firstname'], 'string', 'min' => '2'],
                [['casesheetno', 'tenant_id', 'patient_care_taker', 'patient_category_id', 'created_by', 'modified_by'], 'integer'],
                [['patient_reg_date', 'patient_dob', 'created_at', 'modified_at', 'deleted_at', 'patient_mobile', 'patient_bill_type', 'patient_guid', 'patient_image', 'patient_global_guid', 'patient_global_int_code', 'patient_int_code', 'patient_secondary_contact', 'parent_id', 'migration_id', 'migration_details', 'migration_created_by', 'allpatient'], 'safe'],
                [['status'], 'string'],
                [['patient_title_code'], 'string', 'max' => 10],
                [['patient_firstname', 'patient_lastname', 'patient_relation_name', 'patient_care_taker_name', 'patient_occupation', 'patient_email', 'patient_ref_id'], 'string', 'max' => 50],
                [['patient_relation_code', 'patient_gender', 'patient_marital_status', 'patient_reg_mode', 'patient_type'], 'string', 'max' => 2],
                [['patient_blood_group'], 'string', 'max' => 5],
                [['patient_ref_hospital', 'patient_ref_doctor'], 'string', 'max' => 255],
                ['patient_mobile', 'match', 'pattern' => '/^[0-9]{10}$/', 'message' => 'Mobile must be 10 digits only'],
                ['patient_mobile', 'match', 'pattern' => '/^[789]\d{9}$/', 'message' => 'Invalid mobile number'],
                ['patient_secondary_contact', 'match', 'pattern' => '/^[0-9]{10}$/', 'message' => 'Secondary contact must be 10 digits only'],
                ['patient_secondary_contact', 'match', 'pattern' => '/^[789]\d{9}$/', 'message' => 'Invalid secondary contact'],
                ['patient_email', 'email'],
//            ['patient_image', 'file', 'extensions'=> 'jpg, gif, png'],
            [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'casesheetno'], 'message' => 'The combination of Casesheetno has already been taken.', 'on' => 'casesheetunique'],
                [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'patient_int_code'], 'message' => 'The combination of Patient Internal Code has already been taken.'],
        ];
    }

    public function validateDOB($attribute, $params) {
        $patient_dob = date('Y-m-d', strtotime(str_replace("/", "-", $this->patient_dob)));
        if (strtotime(date('Y-m-d')) < strtotime(date('Y-m-d', strtotime($patient_dob)))) {
            $this->addError($attribute, "Patient DOB must be lesser than Today");
        }
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'patient_id' => 'Patient ID',
            'tenant_id' => 'Tenant ID',
            'patient_reg_date' => 'Registration Date',
            'patient_title_code' => 'Title Code',
            'patient_firstname' => 'Firstname',
            'patient_lastname' => 'Lastname',
            'patient_relation_code' => 'Relation Code',
            'patient_relation_name' => 'Relation Name',
            'patient_care_taker' => 'Care Taker',
            'patient_care_taker_name' => 'Care Taker Name',
            'patient_dob' => 'Dob',
            'patient_gender' => 'Gender',
            'patient_marital_status' => 'Marital Status',
            'patient_occupation' => 'Occupation',
            'patient_blood_group' => 'Blood Group',
            'patient_category_id' => 'Category',
            'patient_email' => 'Email',
            'patient_reg_mode' => 'Reg Mode',
            'patient_type' => 'Type',
            'patient_ref_hospital' => 'Ref Hospital',
            'patient_ref_doctor' => 'Ref Doctor',
            'patient_ref_id' => 'Ref ID',
            'patient_mobile' => 'Mobile',
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
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatPatientAddress() {
        return $this->hasOne(PatPatientAddress::className(), ['patient_global_guid' => 'patient_global_guid']);
    }

    public function getPatientCategory() {
        return $this->hasOne(CoPatientCategory::className(), ['patient_cat_id' => 'patient_category_id']);
    }

    public function getActivePatientAlert() {
        return $this->hasMany(PatAlert::className(), ['patient_id' => 'patient_id'])->status()->active()->orderBy(['created_at' => SORT_DESC]);
    }

    public function getActivePatientAllergies() {
        return $this->hasMany(PatAllergies::className(), ['patient_id' => 'patient_id'])->status()->active()->orderBy(['created_at' => SORT_DESC]);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatActiveEncounter() {
        return $this->hasOne(PatEncounter::className(), ['patient_id' => 'patient_id'])->status()->orderBy(['encounter_date' => SORT_DESC]);
    }

    public function getPatLastAppointment() {
        return $this->hasOne(PatAppointment::className(), ['patient_id' => 'patient_id'])->status()->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPatLastSeenAppointment() {
        return $this->hasOne(PatAppointment::className(), ['patient_id' => 'patient_id'])
                        ->status()
                        ->andWhere(['appt_status' => 'S'])
                        ->orderBy(['created_at' => SORT_DESC]);
    }

    public function getPatActiveIp() {
        return $this->hasOne(PatEncounter::className(), ['patient_id' => 'patient_id'])->status()->encounterType()->orderBy(['encounter_date' => SORT_DESC]);
    }

    public function getPatActiveOp() {
        return $this->hasOne(PatEncounter::className(), ['patient_id' => 'patient_id'])->status()->encounterType('OP')->orderBy(['encounter_date' => SORT_DESC]);
    }

    //Last completed encounter so status is 0
    public function getPatPreviousEncounter() {
        return $this->hasOne(PatEncounter::className(), ['patient_id' => 'patient_id'])->status('0')->orderBy(['encounter_date' => SORT_DESC]);
    }

    public function getPatHaveOneEncounter() {
        return $this->hasOne(PatEncounter::className(), ['patient_id' => 'patient_id'])->orderBy(['encounter_date' => SORT_DESC]);
    }

    public function getPatHaveEncounter() {
        return $this->hasOne(PatEncounter::className(), ['patient_id' => 'patient_id'])->status('1')->orderBy(['encounter_id' => SORT_DESC]);
    }

    public function getPatActiveOPEncounters() {
        return $this->hasMany(PatEncounter::className(), ['patient_id' => 'patient_id'])->andWhere(['encounter_type' => 'OP'])->status('1')->orderBy(['encounter_id' => SORT_DESC]);
    }

    /**
     * @return ActiveQuery
     */
    public function getPatActiveCasesheetno() {
        return $this->hasOne(PatPatientCasesheet::className(), ['patient_id' => 'patient_id'])->tenant()->status()->active();
    }

    public function getPatGlobalPatient() {
        return $this->hasOne(PatGlobalPatient::className(), ['patient_global_guid' => 'patient_global_guid']);
    }

    public function getGlPatient() {
        return $this->hasOne(GlPatient::className(), ['patient_global_guid' => 'patient_global_guid']);
    }

    public function getGlMergedPatient() {
        return $this->hasOne(GlPatient::className(), ['patient_global_guid' => 'migration_id']);
    }

//    public function getPatMergedGlobalPatient() {
//        return $this->hasOne(PatGlobalPatient::className(), ['patient_global_guid' => 'migration_id']);
//    }

    public function getPatatleastoneencounter() {
        $all_patient_id = PatPatient::find()
                ->select('GROUP_CONCAT(patient_id) AS allpatient')
                ->where(['patient_global_guid' => $this->patient_global_guid])
                ->one();
        return PatEncounter::find()
                        ->where("patient_id IN ($all_patient_id->allpatient)")->count();
    }

    public function beforeSave($insert) {
        if (!empty($this->patient_dob))
            $this->patient_dob = date('Y-m-d', strtotime(str_replace("/", "-", $this->patient_dob)));

        if ($insert) {
            $this->patient_guid = UuidHelpers::uuid();

            if (empty($this->patient_reg_date))
                $this->patient_reg_date = date('Y-m-d H:i:s');

            $this->patient_int_code = CoInternalCode::generateInternalCode('P', 'common\models\PatPatient', 'patient_int_code');
            //If Global ID empty means we will generate otherwise it could be imported data
            if (empty($this->patient_global_guid))
                $this->patient_global_guid = self::guid();

            if (empty($this->patient_global_int_code)) {
                $org_id = Yii::$app->user->identity->user->org_id;
                $this->patient_global_int_code = GlInternalCode::generateInternalCode($org_id, 'PG', 'common\models\GlPatient', 'patient_global_int_code');
            }
        }

        $global_patient = new PatGlobalPatient();
        if (!empty($this->patGlobalPatient)) {
            $global_patient = $this->patGlobalPatient;
        }
        $global_patient->patient_global_guid = $this->patient_global_guid;
        $global_patient->patient_category_id = $this->patient_category_id;
//            foreach ($this->_global_fields as $global_field) {
//                $global_patient->$global_field = $this->$global_field;
//            }
        $global_patient->save(false);

        return parent::beforeSave($insert);
    }

    public static function guid() {
        $guid = UuidHelpers::uuid();
        do {
            $patient = GlPatient::find()->where(['patient_global_guid' => $guid])->one();

            if (!empty($patient)) {
                $old_guid = $guid;
                $guid = UuidHelpers::uuid();
            } else {
                break;
            }
        } while ($old_guid != $guid);
        return $guid;
    }

    public function afterSave($insert, $changedAttributes) {
        if (is_object($this->patient_guid))
            $this->patient_guid = $this->patient_guid->toString();

        if (is_object($this->patient_global_guid))
            $this->patient_global_guid = $this->patient_global_guid->toString();

        if ($insert) {
            CoInternalCode::increaseInternalCode("P");

            $model = new PatPatientCasesheet();
            $model->attributes = [
                'casesheet_no' => CoInternalCode::generateInternalCode('CS', 'common\models\PatPatientCasesheet', 'casesheet_no'),
                'patient_id' => $this->patient_id,
                'start_date' => date("Y-m-d"),
            ];
            $model->save(false);
            CoInternalCode::increaseInternalCode("CS");

            $header = "Patient Registration";
            $message = "{$this->fullname} Registered Successfully.";
            $date = $this->patient_reg_date;
            $activity = 'Patient Added Successfully (#' . $this->fullname . ' )';
        } else {
            $header = "Patient Update";
            $message = "Patient Details Updated Successfully.";
            $date = date('Y-m-d H:i:s');
            $activity = 'Patient Updated Successfully (#' . $this->fullname . ' )';
        }
        CoAuditLog::insertAuditLog(PatPatient::tableName(), $this->patient_id, $activity);
        $this->savetoHms($insert);

        $encounter_id = !empty($this->patActiveEncounter) ? $this->patActiveEncounter->encounter_id : null;

        if (is_null($encounter_id)) {
            $encounter_id = !empty($this->patPreviousEncounter) ? $this->patPreviousEncounter->encounter_id : null;
        }
        PatTimeline::insertTimeLine($this->patient_id, $date, $header, '', $message, 'BASIC', $encounter_id);

        return parent::afterSave($insert, $changedAttributes);
    }

    public function getUnsetcols() {
        $unset_cols = ['patient_id', 'created_at', 'modified_at', 'status'];
        return array_combine($unset_cols, $unset_cols);
    }
    
    public function getUnsetupdatecols() {
        $unset_cols = ['patient_id', 'created_at', 'modified_at', 'status', 'tenant_id', 'patient_int_code', 'patient_guid'];
        return array_combine($unset_cols, $unset_cols);
    }

    /* Use to prevent the save to HMS */

    public $saveHms = true;

    /* Save to HMS Database */

    protected function savetoHms($insert) {
        if ($this->saveHms) {
            $unset_cols = $this->getUnsetcols();
            $update_unset_cols = $this->getUnsetupdatecols();

            $patient = GlPatient::find()->where(['patient_global_guid' => $this->patient_global_guid])->one();

            $save = false;
            if ($insert) {
                if (empty($patient)) {
                    $model = new GlPatient;
                    $save = true;
                    $gl_patient_insert = true;
                    $attr = array_diff_key($this->attributes, $unset_cols);
                }
            } else {
                if (!empty($patient)) {
                    $model = $patient;
                    $save = true;
                    $gl_patient_insert = false;
                    $attr = array_diff_key($this->attributes, $update_unset_cols);
                    $this->updateAllPatient($patient);
                }
            }

            if ($save) {
                $model->attributes = $attr;
                foreach ($this->_global_fields as $global_field) {
                    $model->$global_field = $this->$global_field;
                }
                $model->save(false);
                if ($gl_patient_insert) {
                    $org_id = Yii::$app->user->identity->user->org_id;
                    GlInternalCode::increaseInternalCode($org_id, "PG");
                }
            }

            // Link Patient and Tenant
            $this->updatePatientTenant();

            if ($insert) {
                // Link Patient and Share
                $this->insertPatientResource();
            }
        }
    }

    /* Update Patient details to all Database */

    protected function updateAllPatient($patient) {
        $unset_cols = $this->getUnsetcols();

        $newAttrs = $this->getAttributes();
        $oldAttrs = $this->oldAttributes;

        $result = array_diff_assoc($newAttrs, $oldAttrs);
        $attr = array_diff_key($result, $unset_cols);

        if (!empty($attr)) {
            $tenants = GlPatientTenant::find()->where(['patient_global_guid' => $this->patient_global_guid])->all();
            foreach ($tenants as $key => $tenant) {
                $connection = new Connection([
                    'dsn' => "mysql:host={$tenant->org->org_db_host};dbname={$tenant->org->org_database}",
                    'username' => $tenant->org->org_db_username,
                    'password' => $tenant->org->org_db_password,
                ]);
                $connection->open();

                $query = "UPDATE pat_patient SET";
                foreach ($attr as $col => $value) {
                    $query .= " $col = '$value',";
                }
                $query = rtrim($query, ',');
                $query .= " WHERE patient_global_guid = '{$this->patient_global_guid}' ";

                $command = $connection->createCommand($query);
                $command->execute();
                $connection->close();
            }
        }
    }

    protected function updatePatientTenant() {
        $pat_ten_attr = [
            'tenant_id' => $this->tenant_id,
            'org_id' => $this->tenant->org_id,
            'patient_global_guid' => $this->patient_global_guid,
            'patient_guid' => $this->patient_guid
        ];

        $patient_tenant = GlPatientTenant::find()->where($pat_ten_attr)->one();

        if (empty($patient_tenant)) {
            $model = new GlPatientTenant;
            $model->attributes = $pat_ten_attr;
            $model->save(false);
        }
    }

    public function insertPatientResource() {
        $pat_share_attr = [
            'tenant_id' => $this->tenant_id,
            'org_id' => $this->tenant->org_id,
            'patient_global_guid' => $this->patient_global_guid
        ];

        GlPatientShareResources::deleteAll($pat_share_attr);

        $share_config = AppConfiguration::find()->tenant($this->tenant_id)->andWhere("`key` like '%SHARE_%' AND `value` = '1'")->all();
        $share_resources = ArrayHelper::map($share_config, 'key', 'code');

        foreach ($share_resources as $key => $share_resource) {
            $patient_share = new GlPatientShareResources;
            $pat_share_attr['resource'] = $share_resource;
            $patient_share->attributes = $pat_share_attr;
            $patient_share->save(false);
        }
    }

    public static function find() {
        return new PatPatientQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'fullname' => function ($model) {
                return $model->fullname;
            },
            'patient_age' => function ($model) {
                return $model->patient_age;
            },
            'patient_age_year' => function ($model) {
                return $model->patient_age_year;
            },
            'patient_age_month' => function ($model) {
                return $model->patient_age_month;
            },
            'patient_age_ym' => function ($model) {
                return $model->patient_age_ym;
            },
            'patient_img_url' => function ($model) {
                return $model->patient_img_url;
            },
            'org_name' => function ($model) {
                return $model->org_name;
            },
            'patient_category' => function ($model) {
                return $model->patient_category;
            },
            'patient_category_fullname' => function ($model) {
                return $model->patient_category_fullname;
            },
            'patient_category_color' => function ($model) {
                return $model->patient_category_color;
            },
            'address' => function ($model) {
                if (isset($model->patPatientAddress))
                    return $model->patPatientAddress;
            },
            'hasalert' => function () {
                return $this->hasalert;
            },
            'hasallergies' => function () {
                return $this->hasallergies;
            },
            'alert' => function ($model) {
                if (!empty($this->activePatientAlert)) {
                    return $this->activePatientAlert[0]->alert_description;
                }
            },
            'allergies' => function ($model) {
                if (!empty($this->activePatientAllergies)) {
                    return $this->activePatientAllergies[0]->notes;
                }
            },
            'billing_type' => function ($model) {
                if (isset($model->patient_bill_type) && $model->patient_bill_type != '') {
                    return $model->patient_bill_type;
                }
            },
            'fullcurrentaddress' => function ($model) {
                return $model->fullcurrentaddress;
            },
            'printpermanentaddress' => function ($model) {
                if (isset($model->patPatientAddress)) {
                    $result = '';
                    if ($model->patPatientAddress->addr_perm_address != '') {
                        $result .= preg_replace("/\r|\n/", "", $model->patPatientAddress->addr_perm_address);
                    }
                    return $result;
                }
            },
            'fullpermanentaddress' => function ($model) {
                if (isset($model->patPatientAddress)) {
                    $result = '';
                    if ($model->patPatientAddress->addr_perm_address != '') {
                        $result .= preg_replace("/\r|\n/", "", $model->patPatientAddress->addr_perm_address);
                    }

                    if ($model->patPatientAddress->addr_perm_city_id != '') {
                        $result .= ' ' . $model->patPatientAddress->addrPermCity->city_name;
                    }

                    if ($model->patPatientAddress->addr_perm_state_id != '') {
                        $result .= ' ' . $model->patPatientAddress->addrPermState->state_name;
                    }

                    if ($model->patPatientAddress->addr_perm_country_id != '') {
                        $result .= ' ' . $model->patPatientAddress->addrPermCountry->country_name;
                    }
                    return $result;
                }
            },
            'activeCasesheetno' => function ($model) {
                if (isset($model->patActiveCasesheetno))
                    return $model->patActiveCasesheetno->casesheet_no;
            },
            'patActiveIp' => function ($model) {
                return isset($model->patActiveIp);
            },
            'doa' => function ($model) {
                return isset($model->patActiveIp) ? date('d/m/Y', strtotime($model->patActiveIp->encounter_date)) : '';
            },
            'current_room' => function ($model) {
                return $model->current_room;
            },
            'current_room_type_id' => function ($model) {
                return $model->current_room_Type;
            },
            'clinical_discharge_date' => function ($model) {
                return $model->clinical_discharge;
            },
            'last_consultant_id' => function ($model) {
                return isset($model->patLastAppointment) ? $model->patLastAppointment->consultant_id : '';
            },
            'last_patient_cat_id' => function ($model) {
                return isset($model->patLastSeenAppointment) ? $model->patLastSeenAppointment->patient_cat_id : '';
            },
            'consultant_name' => function ($model) {
                if (isset($model->patActiveIp)) {
                    $consultant = $model->patActiveIp->patCurrentAdmission->consultant;
                    return $consultant->title_code . $consultant->name;
                } else if (isset($model->patActiveOp)) {
                    $consultant = $model->patActiveOp->patLiveAppointmentBooking->consultant;
                    return $consultant->title_code . $consultant->name;
                } else {
                    return '-';
                }
            },
            'consultant_id' => function ($model) {
                if (isset($model->patActiveIp)) {
                    $consultant = $model->patActiveIp->patCurrentAdmission->consultant;
                    return $consultant->user_id;
                } else if (isset($model->patActiveOp)) {
                    $consultant = $model->patActiveOp->patLiveAppointmentBooking->consultant;
                    return $consultant->user_id;
                } else {
                    return '-';
                }
            },
            'have_encounter' => function($model) {
                return (isset($model->patHaveEncounter));
            },
            'have_atleast_encounter' => function($model) {
                if ($model->patatleastoneencounter == 0) {
                    return false;
                } else {
                    return true;
                }
            },
            'encounter_type' => function($model) {
                return (isset($model->patHaveEncounter)) ? $model->patHaveEncounter->encounter_type : '';
            },
            'incomplete_profile' => function($model) {
                return $model->incomplete_profile;
            },
            'name_with_casesheet' => function($model) {
                $name = ucfirst($model->patient_firstname);
                if (isset($model->patActiveCasesheetno))
                    $name .= ' (' . $model->patActiveCasesheetno->casesheet_no . ')';
                return $name;
            },
            'active_op_current_status' => function($model) {
                if (isset($model->patActiveOp->patLiveAppointmentArrival)) {
                    return 'Arrived';
                } elseif (isset($model->patActiveOp->patLiveAppointmentBooking)) {
                    return 'Booked';
                } else {
                    return '-';
                }
            },
            'new_user' => function($model) {
                return $model->new_user;
            },
            'name_with_int_code' => function($model) {
                $name = ucfirst($model->patient_firstname);

                if ($model->patient_lastname != '')
                    $name .= ' ' . $model->patient_lastname . ' ';

                if ($model->patient_global_int_code != '')
                    $name .= ' (' . $model->patient_global_int_code . ')';
                return $name;
            },
            'childrens_count' => function ($model) {
                return $model->glPatient->patPatientChildrensCount;
            },
            'childrens_global_ids' => function ($model) {
                return implode(',', $model->glPatient->patPatientChildrensGlobalIds);
            },
            'migration_created_by' => function ($model) {
                $global_record = $model->glPatient->getPatPatientChildrens()->one();
                if (!empty($global_record)) {
                    $user = CoUser::find()->andWhere(['user_id' => $global_record->migration_created_by])->one();
                    if (!empty($user)) {
                        return $user->title_code . ucfirst($user->name);
                    }
                }
                return false;
            },
            'have_patient_group' => function ($model) {
                return !empty($model->patGlobalPatient->patientGroups);
            },
        ];

        foreach ($this->_global_fields as $global_field) {
            $extend_glb = [$global_field => function($model, $global_field) {
                    return $model->glPatient->$global_field;
                }];
            $extend = array_merge($extend_glb, $extend);
        }

        $parent_fields = parent::fields();
        $addt_keys = [];
        if ($addtField = Yii::$app->request->get('addtfields')) {
            switch ($addtField):
                case 'search':
                    $addt_keys = ['patient_img_url', 'fullcurrentaddress', 'fullpermanentaddress', 'fullname', 'patient_guid', 'patient_age', 'patient_global_int_code', 'patient_mobile', 'org_name', 'patient_age_year', 'patient_age_month', 'patient_age_ym', 'childrens_global_ids'];
                    break;
                case 'salecreate':
                    $pFields = ['patient_id', 'patient_guid'];
                    $parent_fields = array_combine($pFields, $pFields);
                    $addt_keys = ['name_with_int_code', 'fullname', 'last_consultant_id', 'patient_global_int_code', 'consultant_name'];
                    break;
                case 'merge_search':
                    $addt_keys = ['patient_img_url', 'fullcurrentaddress', 'fullpermanentaddress', 'fullname', 'patient_guid', 'patient_age', 'patient_global_int_code', 'patient_mobile', 'org_name', 'childrens_count', 'patient_age_ym'];
                    break;
            endswitch;
        }

        $extFields = ($addt_keys) ? array_intersect_key($extend, array_flip($addt_keys)) : $extend;
        return array_merge($parent_fields, $extFields);
    }

    public function getHasalert() {
        return (!empty($this->activePatientAlert)) ? true : false;
    }

    public function getHasallergies() {
        return (!empty($this->activePatientAllergies)) ? true : false;
    }

    public function getIncomplete_profile() {
        if (!isset($this->patPatientAddress)) {
            return true;
        } else if ($this->patPatientAddress->isIncompleteProfile()) {
            return true;
        } else if ($this->glPatient->isIncompleteProfile()) {
            return true;
        }
        return false;
    }

    public function getCurrent_room() {
        if (isset($this->patActiveIp)) {
            $admission = $this->patActiveIp->patCurrentAdmission;
            return "{$admission->floor->floor_name} > {$admission->ward->ward_name} > {$admission->room->bed_name} ({$admission->roomType->room_type_name})";
        } else {
            return '-';
        }
    }

    public function getCurrent_room_type() {
        if (isset($this->patActiveIp)) {
            $admission = $this->patActiveIp->patCurrentAdmission;
            return "{$admission->roomType->room_type_id}";
        } else {
            return '-';
        }
    }

    public function getClinical_discharge() {
        if (isset($this->patActiveIp)) {
            $admission = $this->patActiveIp->patAdmissionClinicalDischarge;
            if (isset($admission)) {
                return "{$admission->status_date}";
            } else {
                return '-';
            }
        } else {
            return '-';
        }
    }

    public function getNew_user() {
        $active_op = $this->patActiveOp;
        if (isset($active_op) && !empty($active_op)) {
            if ($this->getPatLastSeenAppointment()->count() == 0) {
                return true;
            }
            return false;
        }
        return false;
    }

    public function getFullcurrentaddress() {
        if (isset($this->patPatientAddress)) {
            $result = '';
            if ($this->patPatientAddress->addr_current_address != '') {
                $result .= $this->patPatientAddress->addr_current_address;
            }

//            if ($this->patPatientAddress->addr_city_id != '') {
//                $result .= ' ' . $this->patPatientAddress->addrCity->city_name;
//            }
//
//            if ($this->patPatientAddress->addr_state_id != '') {
//                $result .= ' ' . $this->patPatientAddress->addrState->state_name;
//            }
//
//            if ($this->patPatientAddress->addr_country_id != '') {
//                $result .= ' ' . $this->patPatientAddress->addrCountry->country_name;
//            }

            return $result;
        }
    }

    public function getFullname() {
        return ucwords("{$this->patient_title_code} {$this->patient_firstname}");
    }

    public function getPatient_age() {
        $age = '';
        if ($this->patient_dob != '' && $this->patient_dob != "0000-00-00") {
            //$age = self::getPatientAge($this->patient_dob);
            $age = HelperComponent::getAgeWithMonth($this->patient_dob);
            //$patient_age = $age['years'] . '.' . $age['months'];
            $patient_age = $age['years'];
            return $patient_age;
        }
    }

    public function getPatient_age_year() {
        $age = '';
        if ($this->patient_dob != '' && $this->patient_dob != "0000-00-00") {
            $age = HelperComponent::getAgeWithMonth($this->patient_dob);
            return $age['years'];
        }
    }

    public function getPatient_age_month() {
        $age = '';
        if ($this->patient_dob != '' && $this->patient_dob != "0000-00-00") {
            $age = HelperComponent::getAgeWithMonth($this->patient_dob);
            return $age['months'];
        }
    }

    public function getPatient_age_ym() {
        $age = '';

        if ($this->patient_age_year > 0)
            $age .= $this->patient_age_year . 'y';
//        if ($this->patient_age_year > 0 && $this->patient_age_month > 0)
//            $age .= ' ';
//        if ($this->patient_age_month > 0)
//            $age .= $this->patient_age_month . 'm';

        return $age;
    }

    public function getOrg_name() {
        if (isset($this->tenant->tenant_name))
            return $this->tenant->tenant_name;
    }

    public function getPatient_category() {
        if (isset($this->patientCategory->patient_short_code)) {
            return $this->patientCategory->patient_short_code;
        }
    }

    public function getPatient_category_fullname() {
        if (isset($this->patientCategory->patient_cat_name)) {
            return $this->patientCategory->patient_cat_name;
        }
    }

    public function getPatient_category_color() {
        if (isset($this->patientCategory->patient_cat_color) && strtolower($this->patientCategory->patient_cat_color) != '#ffffff') {
            return $this->patientCategory->patient_cat_color;
        } else {
            return "#19A9D5";
        }
    }

    public static function getPatientAge($date) {
        $birthDate = date('m/d/Y', strtotime($date));
        $birthDate = explode("/", $birthDate);
        return (date("md", date("U", mktime(0, 0, 0, $birthDate[0], $birthDate[1], $birthDate[2]))) > date("md") ? ((date("Y") - $birthDate[2]) - 1) : (date("Y") - $birthDate[2]));
    }

    public static function getPatientBirthdate($age, $months = 0) {
        return date('Y-m-d', strtotime($age . ' years ' . $months . ' months ago'));
    }

    public static function getPatientlist($tenant = null, $status = '1', $deleted = false) {
        if (!$deleted)
            $list = self::find()->tenant($tenant)->status($status)->active()->all();
        else
            $list = self::find()->tenant($tenant)->deleted()->all();

        return $list;
    }

    public static function getPatientByGuid($patient_guid) {
        $patient = self::find()->where(['patient_guid' => $patient_guid])->one();
        return $patient;
    }

    /* I think this function is not used anywhere - prakash* */

    public static function getActiveEncounterByPatientId($patient_id) {
        return PatEncounter::find()->status()->active()->andWhere(['patient_id' => $patient_id])->one();
    }

    public static function getActiveEncounterByPatientGuid($patient_guid) {
        $patient = self::find()->where(['patient_guid' => $patient_guid])->one();
        return self::getActiveEncounterByPatientId($patient->patient_id);
    }

    protected $oldAttributes;

    public function afterFind() {
        if (is_object($this->patient_guid))
            $this->patient_guid = $this->patient_guid->toString();

        $this->oldAttributes = $this->attributes;

        foreach ($this->_global_fields as $global_field) {
            $this->$global_field = @$this->glPatient->$global_field;
        }

        return parent::afterFind();
    }

    public static function getPatientNextVisitDays($date) {
        $now = strtotime(date('Y-m-d'));
        $date = strtotime($date);
        $datediff = abs($now - $date);
        return floor($datediff / (60 * 60 * 24));
    }

    public static function getPatientNextvisitDate($days) {
        $date = date('Y-m-d');
        return date('Y-m-d', strtotime($date . "+$days days"));
    }

    public function getPatient_img_url() {
        if ($this->patient_image)
            return \yii\helpers\Url::to("@web/images/uavatar/{$this->patient_image}", true);

        return false;
    }

}
