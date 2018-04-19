<?php

namespace common\models;

use common\models\query\PatDocumentsQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_documents".
 *
 * @property integer $doc_id
 * @property integer $tenant_id
 * @property integer $patient_id
 * @property integer $doc_type_id
 * @property integer $encounter_id
 * @property string $document_xml
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property PatDocumentTypes $docType
 * @property PatEncounter $encounter
 * @property PatPatient $patient
 * @property CoTenant $tenant
 */
class PatDocuments extends RActiveRecord {

    public $name;
    public $age;
    public $gender;
    public $address;
    public $education;
    public $martial_status;
    public $relationship;
    public $primary_care_giver;
    public $information;
    public $information_adequacy;
    public $total_duration;
    public $mode_of_onset;
    public $course_type;
    public $nature;
    //Collapse menu
    public $treatment_history = false;
    public $family_history = false;
    public $personal_history = false;
    public $birth_and_development = false;
    public $education_history = false;
    public $occupational_history = false;
    public $menstrual_history = false;
    public $marital_history = false;
    public $sexual_history = false;
    public $substance_history = false;
    public $premorbid_personality = false;
    public $mental_status_examination = false;
    //Treatment History Mandatory Fields
    public $rb_pb_treatmenthistory;
    //Family History Mandatory Fields
    public $RBtypeoffamily;
    public $RBtypeofmarriage;
    //Personal History Mandatory Fields
    public $RBpbprenatal;
    public $RBpbperinatal;
    public $RBpbperinatal2;
    public $RBpbdevelopmentmilestone;
    public $RBpbparentallack;
    public $RBpbbreakstudy;
    public $RBpbfrechangeschool;
    public $RBpbacademicperfor;
    public $RBpbteacherrelation;
    public $RBpbstudentrelation;
    public $RBpbworkrecord;
    public $RBfreqchangeofjob;
    public $txtDurationofMarriage;
    public $txtAgeofMarriage;
    public $RBmaritalsexualsatisfac;
    public $RBknowledgeofspouse;
    public $CBattitudetoself;
    //Mental Status Examination Mandatory Fields
    public $RBAppearance;
    public $RBlevelofgrooming;
    public $RBlevelofcleanliness;
    public $RBeyetoeyecontact;
    public $RBrapport;
    public $CBPsychomotorActivity;
    public $RBReactiontime;
    public $RBtempo;
    public $RBvolume;
    public $RBtone;
    public $CBstreamform;
    public $RBQuality;
    public $RBrangeandreactivity;
    public $txtSubjectively;
    public $txtObjectively;
    public $RBAttension;
    public $RBConcentration;
    public $RBOrientation;
    public $memory;
    public $RBImmediate;
    public $RBRecent;
    public $RBRemote;
    public $RBIntelligence;
    public $RBAbstraction;
    public $judgement;
    public $RBPersonal;
    public $RBSocial;
    public $RBTest;
    public $DDLInsight;
    public $RBKnowledgeaboutmentalillness;
    public $RBAttitudeillness;
    //Virtual field for store xml content
    public $document_xml;
    public $audit_log = false;

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'pat_documents';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['patient_id', 'doc_type_id', 'encounter_id'], 'required'],
                [['name', 'age', 'gender', 'address', 'education', 'martial_status', 'relationship'], 'required', 'on' => 'CH'],
                [['name', 'age', 'gender', 'address', 'education', 'martial_status', 'relationship', 'information', 'information_adequacy'], 'required', 'on' => 'MCH'],
            //[['name'], 'required', 'on' => 'MCH'],
            [['information', 'information_adequacy', 'total_duration', 'mode_of_onset', 'course_type', 'nature'], 'required', 'on' => 'CH'],
                [['tenant_id', 'patient_id', 'doc_type_id', 'encounter_id', 'created_by', 'modified_by'], 'integer'],
                [['document_xml', 'status', 'xml_path'], 'string'],
                [['rb_pb_treatmenthistory'], 'required', 'when' => function($model) {
                    if ($model->treatment_history == '1' || $model->treatment_history == 'true')
                        return true;
                }],
                [['RBtypeoffamily', 'RBtypeofmarriage'], 'required', 'when' => function($model) {
                    if ($model->family_history == '1' || $model->family_history == 'true')
                        return true;
                }],
                [['RBpbprenatal', 'RBpbperinatal', 'RBpbperinatal2', 'RBpbdevelopmentmilestone'], 'required', 'when' => function($model) {
                    if ($model->birth_and_development == '1' || $model->birth_and_development == 'true')
                        return true;
                }],
                [['RBpbbreakstudy', 'RBpbfrechangeschool', 'RBpbacademicperfor', 'RBpbteacherrelation', 'RBpbstudentrelation'], 'required', 'when' => function($model) {
                    if ($model->education_history == '1' || $model->education_history == 'true')
                        return true;
                }],
                [['RBpbworkrecord', 'RBfreqchangeofjob'], 'required', 'when' => function($model) {
                    if ($model->occupational_history == '1' || $model->occupational_history == 'true')
                        return true;
                }],
                [['txtDurationofMarriage', 'txtAgeofMarriage', 'RBmaritalsexualsatisfac', 'RBknowledgeofspouse'], 'required', 'when' => function($model) {
                    if ($model->marital_history == '1' || $model->marital_history == 'true')
                        return true;
                }],
                [['CBattitudetoself'], 'required', 'when' => function($model) {
                    if ($model->premorbid_personality == '1' || $model->premorbid_personality == 'true')
                        return true;
                }],
                [['RBAppearance', 'RBlevelofgrooming', 'RBlevelofcleanliness', 'RBeyetoeyecontact', 'RBrapport', 'CBPsychomotorActivity', 'RBReactiontime', 'RBtempo', 'RBvolume', 'RBtone', 'CBstreamform', 'RBQuality', 'RBrangeandreactivity', 'txtSubjectively', 'txtObjectively', 'RBAttension', 'RBConcentration', 'RBOrientation', 'RBIntelligence', 'RBAbstraction', 'DDLInsight', 'RBKnowledgeaboutmentalillness', 'RBAttitudeillness'], 'required', 'when' => function($model) {
                    if ($model->mental_status_examination == '1' || $model->mental_status_examination == 'true')
                        return true;
                }],
                [['created_at', 'modified_at', 'deleted_at', 'treatment_history', 'family_history', 'personal_history', 'birth_and_development', 'education_history', 'occupational_history', 'menstrual_history', 'marital_history', 'sexual_history', 'substance_history', 'premorbid_personality', 'mental_status_examination', 'rb_pb_treatmenthistory', 'RBtypeoffamily', 'RBtypeofmarriage', 'RBpbprenatal', 'RBpbperinatal', 'RBpbperinatal2', 'RBpbdevelopmentmilestone', 'RBpbparentallack', 'RBpbbreakstudy', 'RBpbfrechangeschool', 'RBpbacademicperfor', 'RBpbteacherrelation', 'RBpbstudentrelation', 'RBpbworkrecord', 'RBfreqchangeofjob', 'txtDurationofMarriage', 'txtAgeofMarriage', 'RBmaritalsexualsatisfac', 'RBknowledgeofspouse', 'CBattitudetoself', 'RBAppearance', 'RBlevelofgrooming', 'RBlevelofcleanliness', 'RBeyetoeyecontact', 'RBrapport', 'CBPsychomotorActivity', 'RBReactiontime', 'RBtempo', 'RBvolume', 'RBtone', 'CBstreamform', 'RBQuality', 'RBrangeandreactivity', 'txtSubjectively', 'txtObjectively', 'RBAttension', 'RBConcentration', 'RBOrientation', 'memory', 'RBImmediate', 'RBRecent', 'RBRemote', 'RBIntelligence', 'RBAbstraction', 'judgement', 'RBPersonal', 'RBSocial', 'RBTest', 'DDLInsight', 'RBKnowledgeaboutmentalillness', 'RBAttitudeillness', 'document_xml'], 'safe'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'doc_id' => 'Doc ID',
            'tenant_id' => 'Tenant ID',
            'patient_id' => 'Patient ID',
            'doc_type_id' => 'Doc Type ID',
            'encounter_id' => 'Encounter ID',
            'document_xml' => 'Document Xml',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
            'rb_pb_treatmenthistory' => 'Medication Compliance',
            'RBtypeoffamily' => 'Type of Family',
            'RBtypeofmarriage' => 'Type of Marriage',
            'RBpbprenatal' => 'Prenatal',
            'RBpbperinatal' => 'Perinatal',
            'RBpbperinatal2' => 'Perinatal2',
            'RBpbdevelopmentmilestone' => 'Developmental milestones',
            'RBpbparentallack' => 'Parental Lack',
            'RBpbbreakstudy' => 'Break in Studies',
            'RBpbfrechangeschool' => 'Frequent change of school',
            'RBpbacademicperfor' => 'Academic performance',
            'RBpbteacherrelation' => 'Relationship with teachers',
            'RBpbstudentrelation' => 'Relationship with students',
            'RBpbworkrecord' => 'Work Record',
            'RBfreqchangeofjob' => 'Frequent change of jobs',
            'txtDurationofMarriage' => 'Duration of Marriage',
            'txtAgeofMarriage' => 'Age of Marriage',
            'RBmaritalsexualsatisfac' => 'Marital and Sexual satisfaction',
            'RBknowledgeofspouse' => 'Knowledge of spouse about patient\'s illness prior to marriage',
            'CBattitudetoself' => 'Attitude to self',
            'RBAppearance' => 'Appearance',
            'RBlevelofgrooming' => 'Level of grooming',
            'RBlevelofcleanliness' => 'Level of Cleanliness',
            'RBeyetoeyecontact' => 'Eye to Eye contacat',
            'RBrapport' => 'Rapport',
            'CBPsychomotorActivity' => 'Psychomotor Activity',
            'RBReactiontime' => 'Reaction time',
            'RBtempo' => 'Tempo',
            'RBvolume' => 'Volume',
            'RBtone' => 'Tone',
            'CBstreamform' => 'Stream & Form',
            'RBQuality' => 'Quality',
            'RBrangeandreactivity' => 'Range and reactivity',
            'txtSubjectively' => 'Subjectively',
            'txtObjectively' => 'Objectively',
            'RBAttension' => 'Attension',
            'RBConcentration' => 'Concentration',
            'RBOrientation' => 'Orientation',
            'RBImmediate' => 'Immediate',
            'RBRecent' => 'Recent',
            'RBRemote' => 'Remote',
            'RBIntelligence' => 'Intelligence',
            'RBAbstraction' => 'Abstraction',
            'RBPersonal' => 'Personal',
            'RBSocial' => 'Social',
            'RBTest' => 'Test',
            'DDLInsight' => 'Insight',
            'RBKnowledgeaboutmentalillness' => 'Knowledge about mental illness',
            'RBAttitudeillness' => 'Attitude towards illness & treatment',
            'information' => 'Information (Reliability)',
            'information_adequacy' => 'Information (Adequacy)',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getDocType() {
        return $this->hasOne(PatDocumentTypes::className(), ['doc_type_id' => 'doc_type_id']);
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

    public static function find() {
        return new PatDocumentsQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'document_name' => function ($model) {
                if (isset($model->docType))
                    return $model->docType->doc_type_name;
                else
                    return '-';
            },
            'document_xml' => function ($model) {
                $filename = \yii::getAlias('@webroot') . '/' . $model->xml_path;
                if (file_exists($filename)) {
                    return file_get_contents($filename);
                }
                return '';
            },
            'created_user' => function ($model) {
                return $model->createdUser->title_code . ' ' . $model->createdUser->name;
            },
            'document_details' => function ($model) {
                return $this->getDocumentFulldetails($model);
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public function afterFind() {
        $filename = \yii::getAlias('@webroot') . '/' . $this->xml_path;
        if (file_exists($filename)) {
            $this->document_xml = file_get_contents($filename);
        } else {
            $this->document_xml = '';
        }
        return parent::afterFind();
    }

    public function beforeSave($insert) {
        $this->xml_path = $this->createXMLFile(Yii::$app->user->identity->logged_tenant_id, $this->patient->patient_global_int_code, $this->encounter_id, $this->document_xml, $this->xml_path, $this->docType->doc_type);
        return parent::beforeSave($insert);
    }

    protected function createXMLFile($tenant_id, $patient_id, $encounter_id, $content, $file_name, $file_type) {
        $fpath = "uploads/{$tenant_id}/{$patient_id}";
        \yii\helpers\FileHelper::createDirectory($fpath, 0777);
        if (!empty($file_name)) {
            $splitFile = explode('/', $file_name);
            $file_name = end($splitFile);
        } else {
            $file_name = "{$file_type}_{$encounter_id}_" . time() . ".xml";
        }
        $path = \yii::getAlias('@webroot') . '/' . $fpath . '/' . $file_name;
        $myfile = fopen($path, "w") or die("Unable to open file!");
        fwrite($myfile, $content);
        fclose($myfile);
        chmod($path, 0777);
        return $fpath . '/' . $file_name;
    }

    public function afterSave($insert, $changedAttributes) {
        $document = $this->docType->doc_type_name;
        if ($insert) {
            $activity = '' . $document . ' Added Successfully (#' . $this->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatDocuments::tableName(), $this->doc_id, $activity);
        } else {
            if (isset($this->audit_log) && ($this->audit_log)) {
                $activity = '' . $document . ' Updated Successfully (#' . $this->encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatDocuments::tableName(), $this->doc_id, $activity);
            } else if ($this->docType->doc_type_name == 'Medical Case History') {
                $activity = '' . $document . ' Updated Successfully (#' . $this->encounter_id . ' )';
                CoAuditLog::insertAuditLog(PatDocuments::tableName(), $this->doc_id, $activity);
            }
        }
        return parent::afterSave($insert, $changedAttributes);
    }
    
    public function getDocumentFulldetails($model) {
        return ucwords("{$this->encounter_id} [" . date('d/m/Y', strtotime($this->created_at)) . " | {$model->tenant->tenant_name}]");
    }

}
