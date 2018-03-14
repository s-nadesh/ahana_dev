<?php

namespace common\models;

use cornernote\linkall\LinkAllBehavior;
use Yii;
use yii\db\Expression;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "pat_global_patient".
 *
 * @property integer $global_patient_id
 * @property string $patient_global_guid
 * @property string $parent_id
 * @property integer $migration_created_by
 * @property integer $casesheetno
 * @property string $patient_global_int_code
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
 * @property string $patient_email
 * @property string $patient_reg_mode
 * @property string $patient_type
 * @property string $patient_ref_hospital
 * @property string $patient_ref_doctor
 * @property string $patient_ref_id
 * @property string $patient_mobile
 * @property string $patient_secondary_contact
 * @property string $patient_bill_type
 * @property integer $patient_category_id
 * @property resource $patient_image
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class PatGlobalPatient extends RActiveRecord {
    
    public $complete_profile_fields;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_global_patient';
    }
    
    public function init() {
        $global_attributes = self::getTableSchema()->getColumnNames();
        //$unset_fields = ['parent_id', 'migration_created_by', 'casesheetno', 'patient_global_int_code', 'patient_reg_date', 'patient_relation_code', 'patient_relation_name', 'patient_care_taker', 'patient_care_taker_name', 'patient_marital_status', 'patient_occupation', 'patient_blood_group', 'patient_email', 'patient_reg_mode', 'patient_type', 'patient_ref_hospital', 'patient_ref_doctor', 'patient_ref_id', 'patient_secondary_contact', 'patient_bill_type', 'patient_image', 'created_by', 'created_at', 'modified_by', 'modified_at', 'deleted_at'];
        $unset_fields = ['created_by', 'created_at', 'modified_by', 'modified_at', 'deleted_at'];
        $this->complete_profile_fields = array_diff($global_attributes, $unset_fields);
        return parent::init();
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['patient_global_guid'], 'required'],
                //[['patient_global_guid', 'patient_global_int_code', 'patient_title_code', 'patient_firstname', 'patient_gender', 'created_by'], 'required'],
//            [['migration_created_by', 'casesheetno', 'patient_care_taker', 'created_by', 'modified_by', 'patient_category_id'], 'integer'],
//            [['patient_reg_date', 'patient_dob', 'created_at', 'modified_at', 'deleted_at', 'patient_category_id'], 'safe'],
//            [['patient_image', 'status'], 'string'],
//            [['patient_global_guid', 'parent_id', 'patient_firstname', 'patient_lastname', 'patient_relation_name', 'patient_care_taker_name', 'patient_occupation', 'patient_email', 'patient_ref_id', 'patient_mobile', 'patient_secondary_contact'], 'string', 'max' => 50],
//            [['patient_global_int_code'], 'string', 'max' => 30],
//            [['patient_title_code'], 'string', 'max' => 10],
//            [['patient_relation_code', 'patient_gender', 'patient_marital_status', 'patient_reg_mode', 'patient_type', 'patient_bill_type'], 'string', 'max' => 2],
//            [['patient_blood_group'], 'string', 'max' => 5],
//            [['patient_ref_hospital', 'patient_ref_doctor'], 'string', 'max' => 255],
//            [['patient_global_guid', 'deleted_at'], 'unique', 'targetAttribute' => ['patient_global_guid', 'deleted_at'], 'message' => 'The combination of Patient Global Guid and Deleted At has already been taken.'],
//            [['patient_global_int_code', 'deleted_at'], 'unique', 'targetAttribute' => ['patient_global_int_code', 'deleted_at'], 'message' => 'The combination of Patient Global Int Code and Deleted At has already been taken.']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'global_patient_id' => 'Global Patient ID',
            'patient_global_guid' => 'Patient Global Guid',
//            'parent_id' => 'Parent ID',
//            'casesheetno' => 'Casesheetno',
//            'patient_global_int_code' => 'Patient Global Int Code',
//            'patient_reg_date' => 'Patient Reg Date',
//            'patient_title_code' => 'Patient Title Code',
//            'patient_firstname' => 'Patient Firstname',
//            'patient_lastname' => 'Patient Lastname',
//            'patient_relation_code' => 'Patient Relation Code',
//            'patient_relation_name' => 'Patient Relation Name',
//            'patient_care_taker' => 'Patient Care Taker',
//            'patient_care_taker_name' => 'Patient Care Taker Name',
//            'patient_dob' => 'Patient Dob',
//            'patient_gender' => 'Patient Gender',
//            'patient_marital_status' => 'Patient Marital Status',
//            'patient_occupation' => 'Patient Occupation',
//            'patient_blood_group' => 'Patient Blood Group',
//            'patient_email' => 'Patient Email',
//            'patient_reg_mode' => 'Patient Reg Mode',
//            'patient_type' => 'Patient Type',
//            'patient_ref_hospital' => 'Patient Ref Hospital',
//            'patient_ref_doctor' => 'Patient Ref Doctor',
//            'patient_ref_id' => 'Patient Ref ID',
//            'patient_mobile' => 'Patient Mobile',
//            'patient_secondary_contact' => 'Patient Secondary Contact',
//            'patient_bill_type' => 'Patient Bill Type',
//            'patient_image' => 'Patient Image',
//            'patient_category_id' => 'Patient Category',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    public function getPatPatient() {
        return $this->hasMany(PatPatient::className(), ['patient_global_guid' => 'patient_global_guid']);
    }

//    public function getPatPatientChildrens() {
//        return $this->hasMany(self::className(), ['parent_id' => 'patient_global_guid']);
//    }
//    public function getPatPatientChildrensCount() {
//        return $this->getPatPatientChildrens()->count();
//    }
//    public function getPatPatientChildrensGlobalIds() {
//        return ArrayHelper::map($this->getPatPatientChildrens()->all(), 'patient_global_guid', 'patient_global_int_code');
//    }

    public function behaviors() {
        $extend = [
            LinkAllBehavior::className(),
        ];

        $behaviour = array_merge(parent::behaviors(), $extend);
        return $behaviour;
    }

    public function getPatientGroupsPatients() {
        return $this->hasMany(CoPatientGroupsPatients::className(), ['global_patient_id' => 'global_patient_id']);
    }

    public function getPatientGroups() {
        return $this->hasMany(CoPatientGroup::className(), ['patient_group_id' => 'patient_group_id'])->via('patientGroupsPatients');
    }
    
    public function getGlPatient() {
        return $this->hasOne(GlPatient::className(), ['patient_global_guid' => 'patient_global_guid']);
    }
    //Not Needed this function
    public function isIncompleteProfile() {
        $global_fields = [];
        
        foreach ($this->complete_profile_fields as $global_field) {
            $global_fields[$global_field] = $this->$global_field;
        }
        
        return (in_array(null, $global_fields));
    }

    public function fields() {
        $extend = [
            'fullname' => function ($model) {
                return $model->fullname;
            },
            'fullname_globalcode' => function ($model) {
                return $model->fullname . ' (' . $model->glPatient->patient_global_int_code . ')';
            }];

        $fields = array_merge(parent::fields(), $extend);
                
        if ($onlyField = Yii::$app->request->get('onlyfields')) {
            switch ($onlyField):
                case 'pharmacylist':
                    $only_keys = ['global_patient_id', 'fullname', 'patient_global_guid', 'fullname_globalcode'];
                    break;
            endswitch;

            return array_intersect_key($fields, array_flip($only_keys));
        }
        return $fields;
    }

    public static function syncPatientGroup($global_patient_id, $patient_group_ids, $type = 'link') {
        $patient = self::find()->where(['global_patient_id' => $global_patient_id])->one();
        if ($type == 'link') {
            foreach ($patient_group_ids as $patient_group_id) {
                $groups[] = CoPatientGroup::find()->where(['patient_group_id' => $patient_group_id])->one();
            }
        } else {
            $groups = [];
        }
        $extraColumns = ['created_by' => Yii::$app->user->identity->user_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()')]; // extra columns to be saved to the many to many table
        $unlink = true; // unlink tags not in the list
        $delete = true; // delete unlinked tags

        $patient->linkAll('patientGroups', $groups, $extraColumns, $unlink, $delete);
        return $patient;
    }

    public function getFullname() {
        return ucwords("{$this->glPatient->patient_title_code} {$this->glPatient->patient_firstname}");
    }

}
