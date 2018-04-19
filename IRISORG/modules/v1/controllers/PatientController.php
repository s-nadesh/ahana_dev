<?php

namespace IRISORG\modules\v1\controllers;

use common\components\HelperComponent;
use common\models\CoInternalCode;
use common\models\CoPatient;
use common\models\GlPatient;
use common\models\GlPatientShareResources;
use common\models\GlPatientTenant;
use common\models\PatGlobalPatient;
use common\models\PatPatient;
use common\models\PatPatientAddress;
use common\models\PatPatientCasesheet;
use common\models\PatPrescriptionFrequency;
use common\models\PatPrescriptionRoute;
use common\models\PatTimeline;
use common\models\PatEncounter;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Connection;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * PatientController implements the CRUD actions for CoTenant model.
 */
class PatientController extends ActiveController {

    public $modelClass = 'common\models\PatPatient';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className(),
            'except' => ['getpatienttimeline2']
        ];
        $behaviors['contentNegotiator'] = [
            'class' => ContentNegotiator::className(),
            'formats' => [
                'application/json' => Response::FORMAT_JSON,
            ],
        ];

        return $behaviors;
    }

    public function actions() {
        $actions = parent::actions();
        $actions['index']['prepareDataProvider'] = [$this, 'prepareDataProvider'];

        return $actions;
    }

    public function prepareDataProvider() {
        /* @var $modelClass BaseActiveRecord */
        $modelClass = $this->modelClass;

        return new ActiveDataProvider([
            'query' => $modelClass::find()->tenant()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = CoPatient::find()->where(['patient_id' => $id])->one();
            $model->remove();

            //Remove all related records
            foreach ($model->room as $room) {
                $room->remove();
            }
            //
            return ['success' => true];
        }
    }

    public function actionRegistration() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post['PatPatient']) || !empty($post['PatPatientAddress'])) {
            $model = new PatPatient();
            $addr_model = new PatPatientAddress();

            if (isset($post['PatPatient']['patient_id'])) {
                $patient = PatPatient::find()->where(['patient_id' => $post['PatPatient']['patient_id']])->one();
                if (!empty($patient)) {
                    $model = $patient;

                    if (!empty($patient->patPatientAddress)) {
                        $addr_model = $patient->patPatientAddress;
                        $addr_model->setScenario('update');
                    }
                }
            }
            $model->setScenario('registration');

            if (isset($post['PatPatient'])) {
                $model->attributes = $post['PatPatient'];
                if (isset($post['PatPatient']['patient_dob']) && isset($post['PatPatient']['patient_age']) && $post['PatPatient']['patient_dob'] == '' && $post['PatPatient']['patient_age']) {
                    $newdate = strtotime("-{$post['PatPatient']['patient_age']} year", strtotime(date('Y-m-d')));
                    $model->patient_dob = date('Y-m-d', $newdate);
                }
            }

            $valid = $model->validate();

            if (isset($post['PatPatientAddress'])) {
                $addr_model->attributes = $post['PatPatientAddress'];
                $valid = $addr_model->validate() && $valid;
            }

            if ($valid) {
                $model->save(false);

                if (isset($post['PatPatientAddress'])) {
                    $addr_model->patient_id = $model->patient_id;
                    $addr_model->patient_global_guid = $model->patient_global_guid;
                    $addr_model->save(false);
                }

                $updated_patient = PatPatient::find()->where(['patient_id' => $model->patient_id])->one();

                //Patient Image save - By Nad.
                if (empty($updated_patient->patient_image) && !empty($post['PatPatient']['patient_img_url'])) {
                    $filename = $this->convertBlobToFile($post['PatPatient']['patient_img_url'], $updated_patient);
                    $updated_patient->patient_image = $filename;
                    $updated_patient->save(false);
                    $updated_patient->refresh();
                }


                return ['success' => true, 'patient_id' => $model->patient_id, 'patient_guid' => $model->patient_guid, 'patient' => $updated_patient];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model, $addr_model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionSearch() {
        $post = Yii::$app->getRequest()->post();
        $patients = [];
        $limit = 20;

        if (isset($post['search']) && !empty($post['search']) && strlen($post['search']) >= 2) {
            $text = $post['search'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $lists = PatPatient::find()
                    ->andWhere([
                        'pat_patient.tenant_id' => $tenant_id,
                        'pat_patient.status' => '1'
//                        'pat_patient.deleted_at' => '0000-00-00 00:00:00',
//                        'pat_global_patient.parent_id' => NULL
                    ])
                    ->joinWith(['glPatient b', 'glMergedPatient a'])
//                    ->joinWith(['glPatient' => function($query) {
//                            return $query->from(\common\models\GlPatient::tableName() . ' b');
//                        }])
                    ->andFilterWhere([
                        'or',
                            ['like', 'b.patient_firstname', $text],
                            ['like', 'b.patient_lastname', $text],
                            ['like', 'b.patient_mobile', $text],
                            ['like', 'b.patient_global_int_code', $text],
                            ['like', 'b.casesheetno', $text],
                            ['like', 'a.patient_firstname', $text],
                            ['like', 'a.patient_lastname', $text],
                            ['like', 'a.patient_mobile', $text],
                            ['like', 'a.patient_global_int_code', $text],
                            ['like', 'a.casesheetno', $text],
                    ])
                    ->orWhere("b.parent_id = ''")
                    ->limit($limit)
                    ->all();

            foreach ($lists as $key => $patient) {
                $patients[$key]['Patient'] = $patient;
//                $patients[$key]['PatientAddress'] = $patient->patPatientAddress; // :NOUSE
                $patients[$key]['PatientActiveEncounter'] = $patient->patActiveEncounter;
                $patients[$key]['PatientMerged'] = $patient->glMergedPatient;
                $patients[$key]['same_branch'] = true;
                $patients[$key]['same_org'] = true;
            }

            //Search from same ORG but different branch
            if (empty($patients)) {
                $lists = PatPatient::find()
                        ->andWhere("pat_patient.status = '1' AND pat_patient.tenant_id != {$tenant_id}")
                        ->joinWith(['glPatient b', 'glMergedPatient a'])
                        ->andFilterWhere([
                            'or',
                                ['like', 'b.patient_firstname', $text],
                                ['like', 'b.patient_lastname', $text],
                                ['like', 'b.patient_mobile', $text],
                                ['like', 'b.patient_global_int_code', $text],
                                ['like', 'b.casesheetno', $text],
                                ['like', 'a.patient_firstname', $text],
                                ['like', 'a.patient_lastname', $text],
                                ['like', 'a.patient_mobile', $text],
                                ['like', 'a.patient_global_int_code', $text],
                                ['like', 'a.casesheetno', $text],
                        ])
                        ->orWhere("b.parent_id = ''")
                        ->limit($limit)
                        ->groupBy('a.patient_global_guid')
                        ->all();

                foreach ($lists as $key => $patient) {
                    $patients[$key]['Patient'] = $patient;
                    $patients[$key]['PatientMerged'] = $patient->glMergedPatient;
                    $patients[$key]['same_branch'] = false;
                    $patients[$key]['same_org'] = true;
                }

                //Search from HMS Database but need to check, org have a rights to share basic information.
                $basic_share_enable = \common\models\AppConfiguration::getConfigurationByCode('BASIC');
                if (empty($patients) && $basic_share_enable->value == 1) {

                    $lists = GlPatient::find()
                            ->andWhere("status = '1' AND tenant_id != {$tenant_id} AND (parent_id IS NULL OR parent_id = '')")
                            ->andFilterWhere([
                                'or',
                                    ['like', 'patient_firstname', $text],
                                    ['like', 'patient_lastname', $text],
                                    ['like', 'patient_mobile', $text],
                                    ['like', 'patient_global_int_code', $text],
                            ])
                            ->limit($limit)
                            ->all();

                    foreach ($lists as $key => $patient) {
                        $patients[$key]['Patient'] = $patient;
                        $patients[$key]['same_branch'] = false;
                        $patients[$key]['same_org'] = false;
                    }
                }
            }
        }
        return ['patients' => $patients];
    }

    public function actionMergesearch() {
        $post = Yii::$app->getRequest()->post();
        $patients = [];
        $limit = 20;

        if (isset($post['search']) && !empty($post['search']) && strlen($post['search']) >= 2) {
            $text = $post['search'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $lists = PatPatient::find()
                    ->joinWith(['glPatient b'])
                    ->andWhere([
                        'pat_patient.tenant_id' => $tenant_id,
                        'pat_patient.deleted_at' => '0000-00-00 00:00:00',
                        'b.parent_id' => NULL
                    ])
                    ->andFilterWhere([
                        'or',
                            ['like', 'b.patient_firstname', $text],
                            ['like', 'b.patient_lastname', $text],
                            ['like', 'b.patient_mobile', $text],
                            ['like', 'b.patient_global_int_code', $text],
                            ['like', 'b.casesheetno', $text],
                    ])
                    ->orWhere("b.parent_id = ''")
                    ->limit($limit)
                    ->all();

            foreach ($lists as $key => $patient) {
                $patients[$key]['Patient'] = $patient;
//                $patients[$key]['PatientAddress'] = $patient->patPatientAddress; // :NOUSE
                $patients[$key]['PatientActiveEncounter'] = $patient->patActiveEncounter;
                $patients[$key]['same_branch'] = true;
                $patients[$key]['same_org'] = true;
            }

            //Search from same ORG but different branch
            if (empty($patients)) {
                $lists = PatPatient::find()
                        //->joinWith('patGlobalPatient')
                        ->joinWith(['glPatient b'])
                        ->andWhere("pat_patient.status = '1' AND pat_patient.tenant_id != {$tenant_id} AND b.parent_id IS NULL")
                        ->andFilterWhere([
                            'or',
                                ['like', 'b.patient_firstname', $text],
                                ['like', 'b.patient_lastname', $text],
                                ['like', 'b.patient_mobile', $text],
                                ['like', 'b.patient_global_int_code', $text],
                                ['like', 'b.casesheetno', $text],
                        ])
                        ->orWhere("b.parent_id = ''")
                        ->limit($limit)
                        ->groupBy('pat_patient.patient_global_guid')
                        ->all();

                foreach ($lists as $key => $patient) {
                    $patients[$key]['Patient'] = $patient;
                    $patients[$key]['same_branch'] = false;
                    $patients[$key]['same_org'] = true;
                }

                //Search from HMS Database
//                if (empty($patients)) {
//
//                    $lists = GlPatient::find()
//                            ->andWhere("status = '1' AND tenant_id != {$tenant_id} AND (parent_id IS NULL OR parent_id = '')")
//                            ->andFilterWhere([
//                                'or',
//                                    ['like', 'patient_firstname', $text],
//                                    ['like', 'patient_lastname', $text],
//                                    ['like', 'patient_mobile', $text],
////                                ['like', 'patient_global_int_code', $text],
//                                ['like', 'casesheetno', $text],
//                            ])
//                            ->limit($limit)
//                            ->all();
//
//                    foreach ($lists as $key => $patient) {
//                        $patients[$key]['Patient'] = $patient;
//                        $patients[$key]['same_branch'] = false;
//                        $patients[$key]['same_org'] = false;
//                    }
//                }
            }
        }
        return ['patients' => $patients];
    }

    public function actionGetagefromdate() {
        $post = Yii::$app->request->post();
        $age = '';
        if (isset($post['date'])) {
//            $age = PatPatient::getPatientAge($post['date']);
            $age = HelperComponent::getAgeWithMonth($post['date']);
        }

        return ['age' => $age['years'], 'month' => $age['months']];
    }

    public function actionGetnextvisitdaysfromdate() {
        $post = Yii::$app->request->post();
        $days = '';
        if (isset($post['date'])) {
            $days = PatPatient::getPatientNextVisitDays($post['date']);
        }

        return ['days' => $days];
    }

    public function actionGetdatefromage() {
        $post = Yii::$app->request->post();
        $dob = '';
        if (isset($post['age'])) {
            $dob = PatPatient::getPatientBirthdate($post['age'], @$post['month']);
        }

        return ['dob' => $dob];
    }

    public function actionGetdatefromdays() {
        $post = Yii::$app->request->post();
        $date = '';
        if (isset($post['days'])) {
            $date = PatPatient::getPatientNextvisitDate($post['days']);
        }

        return ['date' => $date];
    }

    public function actionGetpatientaddress() {
        $get = Yii::$app->getRequest()->get();
        return ['address' => PatPatientAddress::find()->where(['patient_id' => $get['id']])->one()];
    }

    public function actionGetpatientlist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['patientlist' => PatPatient::getPatientlist($tenant, $status, $deleted)];
    }

    public function actionGetpatientbyguid() {
        $guid = Yii::$app->getRequest()->post('guid');
        $patient = PatPatient::find()->tenant()->andWhere(['patient_guid' => $guid])->one();
        if (!empty($patient)) {
            if (isset($patient->patActiveCasesheetno)) {
                return $patient;
            } else {
                $model = new PatPatientCasesheet();
                $model->attributes = [
                    'casesheet_no' => CoInternalCode::generateInternalCode('CS', 'common\models\PatPatientCasesheet', 'casesheet_no'),
                    'patient_id' => $patient->patient_id,
                    'start_date' => date("Y-m-d"),
                ];
                $model->save(false);
                CoInternalCode::increaseInternalCode("CS");
                return PatPatient::find()->tenant()->andWhere(['patient_guid' => $guid])->one();
            }
        } else {
            return ['success' => false];
        }
    }

    public function actionGetpatienttimeline() {
        $post = Yii::$app->request->post();
        $guid = $post['guid'];
        $patient = PatPatient::find()->where(['patient_guid' => $guid])->one();
        return ['timeline' => PatTimeline::find()->tenant()->andWhere(['patient_id' => $patient->patient_id])->orderBy(['created_at' => SORT_DESC])->all()];
    }

    public function actionGetpatienttimeline2() {
        $post = Yii::$app->request->post();

        if (!empty($post)) {
            $guid = $post['guid'];

            if ($post['tenant_id'] == 'all') {
                $patient_tenants = GlPatientTenant::find()->where(['patient_global_guid' => $guid])->all();

                $timelines = [];
                foreach ($patient_tenants as $key => $patient_tenant) {
                    if (isset($post['org_tenant_id']) && $post['org_tenant_id'] == $patient_tenant->tenant_id) {
                        $patient = PatPatient::find()->where(['patient_guid' => $patient_tenant->patient_guid])->one();
                        $timeline = PatTimeline::find()->andWhere(['patient_id' => $patient->patient_id, 'tenant_id' => $patient_tenant->tenant_id])->orderBy(['created_at' => SORT_DESC])->all();
                    } else {
                        $connection = new Connection([
                            'dsn' => "mysql:host={$patient_tenant->org->org_db_host};dbname={$patient_tenant->org->org_database}",
                            'username' => $patient_tenant->org->org_db_username,
                            'password' => $patient_tenant->org->org_db_password,
                        ]);
                        $connection->open();

                        $command = $connection->createCommand("SELECT * FROM pat_patient WHERE patient_global_guid = :guid");
                        $command->bindValue(':guid', $guid);
                        $patient = $command->queryAll();

                        $resource_lists = $this->_getPatientResourceList($patient_tenant->org_id, $patient_tenant->tenant_id, $patient_tenant->patient_global_guid);
                        $in_cond = "'" . implode("','", $resource_lists) . "'";

                        $command = $connection->createCommand("SELECT a.*, concat(b.tenant_name, ' - ', c.org_name) as branch "
                                . "FROM pat_timeline a "
                                . "JOIN co_tenant b "
                                . "ON b.tenant_id = a.tenant_id "
                                . "JOIN co_organization c "
                                . "ON c.org_id = b.org_id "
                                . "WHERE a.patient_id = :id "
                                . "AND a.tenant_id = :tenant_id "
                                . "AND a.resource IN ($in_cond) "
                                . "");
                        $command->bindValues([':id' => $patient[0]['patient_id'], ':tenant_id' => $patient_tenant->tenant_id]);
                        $timeline = $command->queryAll();

                        $connection->close();
                    }

                    $timelines = array_merge($timelines, $timeline);
                }
            } else {
                $patient = PatPatient::find()->tenant($post['tenant_id'])->andWhere(['patient_global_guid' => $guid])->one();
                $resource_lists = $this->_getPatientResourceList($patient->tenant->org_id, $post['tenant_id'], $guid);
                $timelines = PatTimeline::find()->tenant($post['tenant_id'])->andWhere([
                            'patient_id' => $patient->patient_id,
                            'resource' => $resource_lists])->orderBy(['created_at' => SORT_DESC])->all();
            }

            return ['timeline' => $timelines];
        }
    }

    protected function _getPatientResourceList($org_id, $tenant_id, $guid) {
        $patient_resources = GlPatientShareResources::find()->where([
                    'org_id' => $org_id,
                    'tenant_id' => $tenant_id,
                    'patient_global_guid' => $guid])->all();

        return ArrayHelper::map($patient_resources, 'resource', 'resource');
    }

    public function actionGetpatientroutelist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['routelist' => PatPrescriptionRoute::getRoutelist($tenant, $status, $deleted)];
    }

    public function actionGetpatientfrequencylist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['frequencylist' => PatPrescriptionFrequency::getFrequencylist($tenant, $status, $deleted)];
    }

    public function actionUploadimage() {
        $file = '';
        $post = Yii::$app->getRequest()->post();

        if (!empty($_FILES) && getimagesize($_FILES['file']['tmp_name'])) {
            $file = addslashes($_FILES['file']['tmp_name']);
            $file = file_get_contents($file);
            $file = base64_encode($file);
            $file = "data:{$_FILES['file']['type']};base64,$file";
        }

        if (isset($post['file_data'])) {
            $file = $post['file_data'];
        }

        if ($post['block'] == 'register')
            return ['success' => true, 'file' => $file];

        if ($file) {
            $model = PatPatient::find()->tenant()->andWhere(['patient_guid' => $_GET['patient_id']])->one();
            $filename = $this->convertBlobToFile($file, $model);
            $model->patient_image = $filename;
            $model->save(false);
            $model->refresh();
            return ['success' => true, 'patient' => $model];
        } else {
            return ['success' => false, 'message' => 'Invalid File'];
        }
    }

    public function actionBlobtofile() {
        $images = PatGlobalPatient::find()->where(['not', ['patient_image' => NULL]])->all();
        foreach ($images as $image) {
            $filename = $this->convertBlobToFile($image->patient_image, $image);
            if ($filename) {
                $image->patient_image = $filename;
                $image->update(false);
            }
            echo $filename;
        }
        exit;
    }

    public function actionZerobytefile() {
        $handle = opendir('images/uavatar/');
        $directory = "images/uavatar/";
        $images = glob($directory . "*.jpg");
        $emptyImages = [];

        $count = 0;
        $emptyImages = '';
        foreach ($images as $image) {
            if (filesize($image) == 0) {
                $fname = basename($image, ".jpg");
                $emptyImages .= "'$fname',";
                $count++;
            }
        }
        echo trim($emptyImages, ",");

        exit;
    }

    protected function convertBlobToFile($base64_string, $model) {
        defined('DS') or define('DS', DIRECTORY_SEPARATOR);
        $gCode = $model->patient_global_int_code;

        $filename = "{$gCode}_" . time() . ".jpg";
        $uploadPath = "images" . DS . "uavatar" . DS;
        if (!file_exists($uploadPath)) {
            mkdir($uploadPath, 0777, true);
        }

        $output_file = $uploadPath . $filename;

        $ifp = fopen($output_file, "wb");
        $data = explode(',', $base64_string);
        if (isset($data[1])) {
            fwrite($ifp, base64_decode($data[1]));
            fclose($ifp);

            $oldFile = "images" . DS . "uavatar" . DS . $model->patient_image;
            if ($model->patient_image && file_exists($oldFile)) {
                unlink($oldFile);
            }
            return $filename;
        }
        return false;
    }

    public function actionImportpatient() {
        $cond = Yii::$app->getRequest()->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        return self::Addnewpatient($cond['patient_global_guid'], $tenant_id);
    }

    public static function Addnewpatient($patient_global_guid, $tenant) {
        $Parent_patient = PatPatient::find()->where([
                    'patient_global_guid' => $patient_global_guid,
                    'tenant_id' => $tenant,
                ])->one();
        if (empty($Parent_patient)) {
            $Patient = PatPatient::find()->where([
                        'patient_global_guid' => $patient_global_guid,
                    ])
                    ->one();

            if (!empty($Patient)) {
                $PatientData = ArrayHelper::toArray($Patient);
                $model = new PatPatient;

                $unset_attr = [
                    'patient_id',
                    'patient_guid',
                    'patient_int_code',
                    'tenant_id',
                    'status',
                    'created_by',
                    'created_at',
                    'modified_by',
                    'modified_at',
                    'fullname',
                    'patient_age',
                    'tenant_name',
                    'org_name',
                ];
                $unset_attr = array_combine($unset_attr, $unset_attr);

                $model->attributes = array_diff_key($PatientData, $unset_attr);
                $model->tenant_id = $tenant;
                if ($model->save(false)) {
                    return ['success' => true, 'patient' => $model];
                } else {
                    return ['success' => false, 'message' => 'Failed to import'];
                }
            } else {
                //Check global patient exists.
                $Patient = GlPatient::find()->where([
                            'patient_global_guid' => $patient_global_guid,
                        ])
                        ->one();
                if (!empty($Patient)) {
                    $PatientData = ArrayHelper::toArray($Patient);
                    $model = new PatPatient;

                    $unset_attr = [
                        'patient_id',
                        'patient_guid',
                        'patient_int_code',
                        'tenant_id',
                        'status',
                        'created_by',
                        'created_at',
                        'modified_by',
                        'modified_at',
                        'fullname',
                        'patient_age',
                        'tenant_name',
                        'org_name',
                    ];
                    $unset_attr = array_combine($unset_attr, $unset_attr);

                    $model->attributes = array_diff_key($PatientData, $unset_attr);
                    $model->tenant_id = $tenant;
                    if ($model->save(false)) {
                        //patGlobalPatient not set because of new patpatient records, that'y new find condition used.
                        $patient = PatPatient::find()->where(['patient_id' => $model->patient_id])->one();
                        return ['success' => true, 'patient' => $patient];
                    } else {
                        return ['success' => false, 'message' => 'Failed to import'];
                    }
                }
            }
        } else {
            return ['success' => true, 'patient' => $Parent_patient];
        }
    }

    public function actionGetpatient() {
        $post = Yii::$app->getRequest()->post();
        $patients = [];
        $limit = 10;
        $only = Yii::$app->request->get('only');

        if (isset($post['search']) && !empty($post['search']) && strlen($post['search']) >= 2) {
            $text = $post['search'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $lists = PatPatient::find()
                    ->andWhere([
                        'pat_patient.tenant_id' => $tenant_id,
                        'pat_patient.deleted_at' => '0000-00-00 00:00:00',
                        'b.parent_id' => NULL
                    ])
                    //->joinWith('patGlobalPatient')
                    ->joinWith(['glPatient b'])
                    ->andFilterWhere([
                        'or',
                            ['like', 'b.patient_firstname', $text],
                            ['like', 'b.patient_lastname', $text],
                            ['like', 'b.patient_mobile', $text],
                            ['like', 'b.patient_global_int_code', $text],
                            ['like', 'b.casesheetno', $text],
                    ])
                    ->limit($limit)
                    ->all();

            $showall = Yii::$app->request->get('showall');
            if (empty($lists) && isset($showall) && $showall == 'yes') {
                $lists = PatPatient::find()
                        ->andWhere([
//                            'pat_patient.tenant_id' => $tenant_id,
                            'pat_patient.deleted_at' => '0000-00-00 00:00:00',
//                            'pat_global_patient.parent_id' => NULL
                            'b.parent_id' => NULL //By Nad at 2018-03-10 5:47 PM
                        ])
                        //->joinWith('patGlobalPatient')
                        ->joinWith(['glPatient b'])
                        ->andFilterWhere([
                            'or',
                                ['like', 'b.patient_firstname', $text],
                                ['like', 'b.patient_lastname', $text],
                                ['like', 'b.patient_mobile', $text],
                                ['like', 'b.patient_global_int_code', $text],
                                ['like', 'b.casesheetno', $text],
                        ])
                        ->groupBy('b.patient_global_int_code')
                        ->limit($limit)
                        ->all();
            }

            if ($only == 'patients') {
                return ['patients' => $lists];
            }

            foreach ($lists as $key => $patient) {
                $patients[$key]['Patient'] = $patient;
                $patients[$key]['PatientAddress'] = $patient->patPatientAddress;
                $patients[$key]['PatientActiveEncounter'] = $patient->patActiveEncounter;
            }
        }
        return ['patients' => $patients];
    }

    public function actionMergepatients() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            $this->migrateTables = $this->_getMigrationTable();
            $parent_id = $tenant_id = $patient_id = $primary_patient_global_int_code = '';
            $childrens = [];
            foreach ($post as $key => $value) {
                if ($value['is_primary']) {
                    $tenant_id = $value['Patient']['tenant_id'];
                    $parent_id = $value['Patient']['patient_global_guid'];
                    $primary_patient_global_int_code = $value['Patient']['patient_global_int_code'];
                    $patient_id = $value['Patient']['patient_id'];
                } else {
                    $childrens[] = $value['Patient']['patient_global_guid'];
                }
            }

            if ($parent_id != '' && !empty($childrens)) {
                $user_id = Yii::$app->user->identity->user->user_id;
                $children_ids = join("', '", $childrens);
                //PatGlobalPatient::updateAll(['parent_id' => $parent_id, 'migration_created_by' => $user_id], "patient_global_guid IN ('$children_ids')");
                GlPatient::updateAll(['parent_id' => $parent_id, 'migration_created_by' => $user_id], "patient_global_guid IN ('$children_ids')");

                $merge_patients = PatPatient::find()->andWhere("patient_global_guid IN ('$children_ids')")->active()->all();

                $connection = Yii::$app->client;
                foreach ($merge_patients as $merge_patient) {
                    if ($merge_patient->tenant_id == $tenant_id) {
                        //Same Tenant
                        $migration_details = json_encode($this->_migratePatientRecordsUp($patient_id, $merge_patient->patient_id));
                        $command = $connection->createCommand("
                            UPDATE pat_patient
                            SET patient_global_guid = :patient_global_guid, migration_id = :migration_id, migration_details = :migration_details, modified_at = NOW(), deleted_at = NOW()
                            WHERE patient_id = :patient_id", [':patient_id' => $merge_patient->patient_id, ':patient_global_guid' => $parent_id, 'migration_id' => $merge_patient->patient_global_guid, 'migration_details' => $migration_details]);
                    } else {
                        //Other Tenant
                        $command = $connection->createCommand("
                            UPDATE pat_patient
                            SET patient_global_guid = :patient_global_guid,  migration_id = :migration_id, modified_at = NOW()
                            WHERE patient_id = :patient_id", [':patient_id' => $merge_patient->patient_id, ':patient_global_guid' => $parent_id, 'migration_id' => $merge_patient->patient_global_guid]);

                        GlPatientTenant::updateAll(['patient_global_guid' => $parent_id], ['patient_global_guid' => $merge_patient->patient_global_guid, 'patient_guid' => $merge_patient->patient_guid, 'tenant_id' => $merge_patient->tenant_id]);
                    }
                    $command->execute();
                }
                $connection->close();

                return ['success' => true, 'message' => "Patient Merged successfully, Primay ID: {$primary_patient_global_int_code}"];
            } else {
                return ['success' => false, 'message' => 'Failed to Merge'];
            }
        }
    }

    private $migrateTables;

    private function _getMigrationTable() {
        $connection = Yii::$app->client;

        $database = $connection->createCommand("SELECT DATABASE()")->queryScalar();

        $command = $connection->createCommand("
            SELECT DISTINCT TABLE_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE COLUMN_NAME IN ('patient_id')
            AND TABLE_NAME NOT IN ('pat_patient')
            AND TABLE_SCHEMA= :db", [':db' => $database]);
        $migrate_tables = ArrayHelper::map($command->queryAll(), 'TABLE_NAME', 'TABLE_NAME');

        $command = $connection->createCommand("
            SELECT DISTINCT TABLE_NAME
            FROM information_schema.views
            WHERE TABLE_SCHEMA= :db", [':db' => $database]);
        $unset_tables = ArrayHelper::map($command->queryAll(), 'TABLE_NAME', 'TABLE_NAME');

        $migrate_tables = array_diff($migrate_tables, $unset_tables);
        $connection->close();

        $migrate_tables = array_map(function($a) {
            $prefix = '\common\models\\';
            return $prefix . \yii\helpers\BaseInflector::camelize($a);
        }, $migrate_tables);

        return $migrate_tables;
    }

    private function _migratePatientRecordsUp($new_patient_id, $old_patient_id) {
        $migrate_tables = $this->migrateTables;
        $merge_details = [];

        $connection = Yii::$app->client;
        foreach ($migrate_tables as $table => $modal) {
            $pk = $modal::primaryKey();
            $merge_details[$table] = array_values(ArrayHelper::map($modal::find()->andWhere(['patient_id' => $old_patient_id])->all(), $pk, $pk));

            $command = $connection->createCommand("
                UPDATE $table
                SET patient_id = :new_patient_id
                WHERE patient_id = :old_patient_id", [':new_patient_id' => $new_patient_id, 'old_patient_id' => $old_patient_id]);
            $command->execute();
        }
        $connection->close();

        return $merge_details;
    }

    public function actionGetpreviousnextpatient() {
        $post = Yii::$app->getRequest()->post();
        $next = '';
        $prev = '';
        $allencounterlist = '';
        $model = PatEncounter::find()->tenant()->status();
        if ($post['encounter_type'] == 'IP') {
            $model->joinWith(['patient', 'patAdmissions'])
                    ->andWhere(['encounter_type' => $post['encounter_type']])
                    ->andFilterWhere(['pat_admission.consultant_id' => $post['consultant_id']])
                    ->orderBy(['encounter_date' => SORT_DESC]);
        }
        if ($post['encounter_type'] == 'OP') {
            $model->joinWith(['patient', 'patAppointments'])
                    ->andFilterWhere(['DATE(encounter_date)' => date('Y-m-d')])
                    ->andFilterWhere(['pat_appointment.consultant_id' => $post['consultant_id']])
                    ->orderBy(['pat_appointment.appt_status' => SORT_ASC,
                        'pat_appointment.status_time' => SORT_ASC,]);
        }

        $encounter = $model->all();

        if (count($encounter) != 1) {
            foreach ($encounter as $index => $enc) {
                if ($enc['patient']['patient_guid'] == $post['guid'])
                    $location_array = $index;
            }
            if (isset($location_array) && $location_array < (count($encounter) - 1)) {
                $next = $encounter[$location_array + 1]['patient']['patient_guid'];
            }
            if (isset($location_array) && ($location_array != 0)) {
                $prev = $encounter[$location_array - 1]['patient']['patient_guid'];
            }
            $allencounterlist = $encounter;
        }
        return ['next' => $next, 'prev' => $prev, 'allencounterlist' => $allencounterlist];
    }

}
