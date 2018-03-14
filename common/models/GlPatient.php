<?php

namespace common\models;

use yii\db\ActiveQuery;
use yii\db\ActiveRecord;
use yii\helpers\ArrayHelper;
use Yii;

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
class GlPatient extends ActiveRecord {

    public $complete_profile_fields;

//    public $parent_id;
    /**
     * @inheritdoc
     */
    public static function tableName() {
        $current_database = Yii::$app->db->createCommand("SELECT DATABASE()")->queryScalar();
        return "$current_database.gl_patient";
    }

    public function init() {
        $global_attributes = self::getTableSchema()->getColumnNames();
        $unset_fields = ['parent_id', 'migration_created_by', 'casesheetno', 'patient_global_int_code', 'patient_reg_date', 'patient_relation_code', 'patient_relation_name', 'patient_care_taker', 'patient_care_taker_name', 'patient_marital_status', 'patient_occupation', 'patient_blood_group', 'patient_email', 'patient_reg_mode', 'patient_type', 'patient_ref_hospital', 'patient_ref_doctor', 'patient_ref_id', 'patient_secondary_contact', 'patient_bill_type', 'patient_image', 'created_by', 'created_at', 'modified_by', 'modified_at', 'deleted_at'];
        $this->complete_profile_fields = array_diff($global_attributes, $unset_fields);
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
            [['patient_title_code', 'patient_firstname', 'patient_gender', 'patient_reg_mode', 'patient_mobile', 'patient_dob'], 'required'],
            [['casesheetno', 'tenant_id', 'patient_care_taker', 'patient_category_id', 'created_by', 'modified_by'], 'integer'],
            [['patient_reg_date', 'patient_dob', 'created_at', 'modified_at', 'deleted_at', 'patient_mobile', 'patient_bill_type', 'patient_guid', 'patient_image', 'patient_global_guid', 'patient_global_int_code', 'patient_int_code', 'patient_secondary_contact', 'parent_id', 'migration_created_by'], 'safe'],
            [['status'], 'string'],
            [['patient_title_code'], 'string', 'max' => 10],
            [['patient_firstname', 'patient_lastname', 'patient_relation_name', 'patient_care_taker_name', 'patient_occupation', 'patient_email', 'patient_ref_id'], 'string', 'max' => 50],
            [['patient_relation_code', 'patient_gender', 'patient_marital_status', 'patient_reg_mode', 'patient_type'], 'string', 'max' => 2],
            [['patient_blood_group'], 'string', 'max' => 5],
            [['patient_ref_hospital', 'patient_ref_doctor'], 'string', 'max' => 255],
            ['patient_mobile', 'match', 'pattern' => '/^[0-9]{10}$/', 'message' => 'Mobile must be 10 digits only'],
            ['patient_secondary_contact', 'match', 'pattern' => '/^[0-9]{10}$/', 'message' => 'Secondary contact must be 10 digits only'],
//            ['patient_image', 'file', 'extensions'=> 'jpg, gif, png'],
            [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'casesheetno', 'deleted_at'], 'message' => 'The combination of Casesheetno has already been taken.', 'on' => 'casesheetunique'],
            [['tenant_id'], 'unique', 'targetAttribute' => ['tenant_id', 'patient_int_code', 'deleted_at'], 'message' => 'The combination of Patient Internal Code has already been taken.'],
        ];
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
            'patient_category_id' => 'Category ID',
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

    public function getPatPatientChildrens() {
        return $this->hasMany(self::className(), ['parent_id' => 'patient_global_guid']);
    }

    public function getPatPatientChildrensCount() {
        return $this->getPatPatientChildrens()->count();
    }

    public function getPatPatientChildrensGlobalIds() {
        return ArrayHelper::map($this->getPatPatientChildrens()->all(), 'patient_global_guid', 'patient_global_int_code');
    }

    public function isIncompleteProfile() {
        $global_fields = [];

        foreach ($this->complete_profile_fields as $global_field) {
            $global_fields[$global_field] = $this->$global_field;
        }

        return (in_array(null, $global_fields));
    }

    /**
     * @return ActiveQuery
     */
//    public static function find() {
//        return new PatPatientQuery(get_called_class());
//    }

    public function fields() {
        $extend = [
            'fullname' => function ($model) {
                return $model->patient_title_code . ucfirst($model->patient_firstname);
            },
            'patient_age' => function ($model) {
                $age = '';
                if ($model->patient_dob != '')
                    $age = self::getPatientAge($model->patient_dob);
                return $age;
            },
            'org_name' => function ($model) {
                if (isset($this->tenant->coOrganization))
                    return $this->tenant->coOrganization->org_name;
            },
            'tenant_name' => function ($model) {
                if (isset($this->tenant->tenant_name))
                    return $this->tenant->tenant_name;
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function getPatientAge($date) {
        $birthDate = date('m/d/Y', strtotime($date));
        $birthDate = explode("/", $birthDate);
        return (date("md", date("U", mktime(0, 0, 0, $birthDate[0], $birthDate[1], $birthDate[2]))) > date("md") ? ((date("Y") - $birthDate[2]) - 1) : (date("Y") - $birthDate[2]));
    }

    public function afterFind() {
        if (is_object($this->patient_guid))
            $this->patient_guid = $this->patient_guid->toString();

        return parent::afterFind();
    }

}
