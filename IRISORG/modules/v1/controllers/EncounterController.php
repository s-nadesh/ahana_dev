<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatAdmission;
use common\models\PatAppointment;
use common\models\PatBillingRecurring;
use common\models\PatBillingRoomChargeHistory;
use common\models\PatEncounter;
use common\models\PatPatient;
use common\models\PatPatientCasesheet;
use common\models\VBillingAdvanceCharges;
use common\models\VBillingOtherCharges;
use common\models\VBillingProcedures;
use common\models\VBillingProfessionals;
use common\models\VBillingRecurring;
use common\models\VEncounter;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * EncounterController implements the CRUD actions for CoTenant model.
 */
class EncounterController extends ActiveController {

    public $modelClass = 'common\models\PatEncounter';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className()
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
            $model = CoEncounter::find()->where(['patient_id' => $id])->one();
            $model->remove();

            //Remove all related records
            foreach ($model->room as $room) {
                $room->remove();
            }
            //
            return ['success' => true];
        }
    }

    public function actionCreateappointment() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $model = new PatEncounter();
            $appt_model = new PatAppointment();
            $case_model = new PatPatientCasesheet();
            $encounter_date = $post['status_date'] . ' ' . $post['status_time'];

            $model_attr = [
                'patient_id' => (isset($post['patient_id']) ? $post['patient_id'] : ''),
                'encounter_type' => 'OP',
                'encounter_date' => $encounter_date,
                'add_casesheet_no' => (isset($post['PatEncounter']['add_casesheet_no']) ? $post['PatEncounter']['add_casesheet_no'] : ''),
                'consultant_id' => @$post['consultant_id']
            ];
            $model->attributes = $model_attr;

            $appt_model->attributes = $post;

            $valid = $model->validate();
            $valid = $appt_model->validate() && $valid;

            if (isset($post['validate_casesheet']) && $post['validate_casesheet']) {
                $case_model->attributes = [
                    'patient_id' => (isset($post['patient_id']) ? $post['patient_id'] : ''),
                    'casesheet_no' => (isset($post['PatEncounter']['add_casesheet_no']) ? $post['PatEncounter']['add_casesheet_no'] : '')
                ];

                $valid = $case_model->validate() && $valid;
            }

            if ($valid) {
                $model->save(false);

                $appt_model->encounter_id = $model->encounter_id;

                //If appointment status is A (Arrived), then save first B (Booked) record
                if ($appt_model->appt_status == "A") {
                    $appt_model->appt_status = "B";
                    $appt_model->save(false);

                    $appt_model = new PatAppointment();
                    $appt_model->attributes = $post;
                    $appt_model->encounter_id = $model->encounter_id;
                    $appt_model->appt_status = "A";
                }

                $appt_model->save(false);

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model, $appt_model, $case_model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionCreateadmission() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $model = new PatEncounter();
            $admission_model = new PatAdmission();
            $case_model = new PatPatientCasesheet();

            if (isset($post['PatEncounter'])) {
                $model->encounter_type = "IP";
                $model->attributes = $post['PatEncounter'];
            }

            if (isset($post['PatAdmission'])) {
                $admission_model->attributes = $post['PatAdmission'];
                if (isset($post['PatEncounter']['encounter_date']))
                    $admission_model->status_date = $post['PatEncounter']['encounter_date'];
            }

            $valid = $model->validate();
            $valid = $admission_model->validate() && $valid;

            if ($post['validate_casesheet']) {
                $case_model->attributes = [
                    'patient_id' => (isset($post['PatAdmission']['patient_id']) ? $post['PatAdmission']['patient_id'] : ''),
                    'casesheet_no' => (isset($post['PatEncounter']['add_casesheet_no']) ? $post['PatEncounter']['add_casesheet_no'] : '')
                ];

                $valid = $case_model->validate() && $valid;
            }

            if ($valid) {

                $model->save(false);

                $admission_model->encounter_id = $model->encounter_id;
                $admission_model->save(false);

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model, $admission_model, $case_model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionUpdateadmission() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $model = PatEncounter::find()->where(['encounter_id' => $post['PatEncounter']['encounter_id']])->one();
            $admission_model = PatAdmission::find()->where(['admn_id' => $post['PatAdmission']['admn_id']])->one();

            $admission_model->attributes = $post['PatAdmission'];
            if (isset($post['PatEncounter']['encounter_date']))
                $model->encounter_date = $admission_model->status_date = $post['PatEncounter']['encounter_date'];

            $valid = $model->validate();
            $valid = $admission_model->validate() && $valid;

            if ($valid) {
                $model->save(false);
                $admission_model->save(false);

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model, $admission_model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionGetencounters() {
        $GET = Yii::$app->getRequest()->get();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        if (isset($GET['id'])) {
            $patient = PatPatient::getPatientByGuid($GET['id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $encounter = VEncounter::find()
                    ->where("patient_id IN ($all_patient_id->allpatient)");
            if (isset($GET['date'])) {
                $encounter->andWhere(['DATE(date)' => $GET['date']]);
            }
            $data = $encounter->orderBy(['encounter_id' => SORT_DESC, 'id' => SORT_ASC])
                    ->asArray()
                    ->all();

            $encounters = array_values(\yii\helpers\ArrayHelper::index($data, null, ['encounter_id', function($element) {
                            return 'all';
                        }]));

//            $activeEncounter = PatPatient::getActiveEncounterByPatientGuid($GET['id']);

            return ['success' => true, 'encounters' => $encounters];
//            return ['success' => true, 'encounters' => $encounters, 'activeEncounter' => $activeEncounter ? $activeEncounter : false];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetallbilling() {
        $get = Yii::$app->getRequest()->get();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        if (isset($get['id'])) {
            $condition['patient_guid'][$get['id']] = $get['id'];

            if (isset($get['date'])) {
                $condition['DATE(date)'] = $get['date'];
            }

            $encounters = VEncounter::find()
                    ->where($condition)
                    ->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->all();

            $data = [];
            foreach ($encounters as $k => $e) {
                if (($e->encounter_type == 'IP' && !$e->encounter->patAdmissionCancel) || ($e->encounter_type == 'OP' && $e->encounter->patAppointmentSeen)) {
                    $data[$k] = $e->toArray();
                    $data[$k]['view_calculation'] = $e->encounter->viewChargeCalculation;

                    if ($e->encounter_type == 'OP')
                        $data[$k]['seen'] = $e->encounter->patAppointmentSeen;

                    if ($e->encounter_type == 'IP') {
                        if (!empty($e->encounter->patAdmissionDischarge)) {
                            $data[$k]['discharge_date'] = $e->encounter->patAdmissionDischarge->status_date;
                        } else {
                            $data[$k]['discharge_date'] = '-';
                        }
                        $data[$k]['details'] = $e->encounter->patCurrentAdmission->getRoomdetails(); // Latest Room Details
                    }
                }
            }

            return ['success' => true, 'encounters' => array_values($data)];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionInpatients() {
        $GET = Yii::$app->getRequest()->get();
        $limit = isset($GET['l']) ? $GET['l'] : 5;
        $page = isset($GET['p']) ? $GET['p'] : 1;
        $offset = abs($page - 1) * $limit;
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $model = PatEncounter::find()
                //->tenant()
                ->andWhere([
                    'current_tenant_id' => $tenant_id,
                ])
                ->status()
                ->encounterType("IP")
                ->orderBy([
                    'encounter_date' => SORT_DESC,
                ])
                ->limit($limit)
                ->offset($offset)
                ->all();

        return $model;
    }

    //Reducing query for speed up. In-Progress
    public function actionOutpatients() {
        $GET = Yii::$app->getRequest()->get();
        $GET['date'] = date('Y-m-d');
        $GET['tenant_id'] = Yii::$app->user->identity->logged_tenant_id;
        $results = $consultants = $only = [];
        if (isset($GET['only'])) {
            $only = explode(",", $GET['only']);
        }
        if (!$only || in_array('counts', $only)) {
            $consultants = $this->OPResultsCount($GET);

            if (@$GET['cid'] == '-1') { // If Can Many Doctor Records
                $cookies = Yii::$app->request->cookies; //KEYWORD: COOKIE EXPAND
                $opRowExp = $cookies->getValue('opRowExp', false);
                if (!$opRowExp) {
                    reset($consultants);
                    $GET['cid'] = key($consultants);
                    $opRowExp = json_encode([['consultant_id' => $GET['cid'], 'rowopen' => true]]);
                    $cookieSend = Yii::$app->response->cookies;
                    $cookieSend->add(new \yii\web\Cookie([
                        'name' => 'opRowExp',
                        'value' => $opRowExp,
                        'httpOnly' => false
                    ]));
                } else {
                    $expandConsultant = array_map(function($row) {
                        return ($row->rowopen == true) ? (int) $row->consultant_id : null;
                    }, json_decode($opRowExp));

                    if (!empty($filterConsult = array_filter($expandConsultant))) {
                        $GET['cid'] = $filterConsult;
                    }
                }
            }
        }

        if (!$only || in_array('results', $only)) {
            $results = $this->OPResults($GET);
        }

        return ['success' => true, 'result' => $results, 'consultants' => $consultants];
    }

    protected function OPResultsCount($params) {
        $consultants = $opRowExp = [];
        $connection = Yii::$app->client;
        $dtop = '=';
        $eStatus = "'0','1'";
        if (strtolower(@$params['type']) == 'previous') {
            $dtop = '<';
            $eStatus = "'1'";
        } else if (@$params['type'] == 'Future') {
            $dtop = '>';
        }
        if (isset($params['month']) && (@$params['month'] != 'undefined') && isset($params['year']) && (@$params['year'] != 'undefined')) {
            $date = $params['year'] . '-' . $params['month'];
            $filterdate = date('m Y', strtotime($date));
            $filterQuery = "AND DATE_FORMAT(d.encounter_date,'%m %Y') = '$filterdate'";
            $filterQuery1 = "AND DATE_FORMAT(b.encounter_date,'%m %Y') = '$filterdate'";
        } else {
            if (@$params['type'] == 'Future') {
                $filterdate = date('m Y');
                $filterQuery = "AND DATE_FORMAT(d.encounter_date,'%m %Y') = '$filterdate'";
                $filterQuery1 = "AND DATE_FORMAT(b.encounter_date,'%m %Y') = '$filterdate'";
            } else if (@$params['type'] == 'previous') {
                $start_date = @$params['range_filter_start'];
                $end_date = @$params['range_filter_end'];
                $filterQuery = "AND DATE(d.encounter_date) BETWEEN '$start_date' and '$end_date'";
                $filterQuery1 = "AND DATE(b.encounter_date) BETWEEN '$start_date' and '$end_date'";
            } else {
                $filterQuery = "";
                $filterQuery1 = "";
            }
        }
        if (is_numeric(@$params['cid']) && @$params['cid'] > 0) {
            $groupQuery = "";
            $consultant_id = @$params['cid'];
            $consultantQuery = "AND a.consultant_id = '$consultant_id'";
        } else {
            $groupQuery = 'GROUP BY a.consultant_id';
            $consultantQuery = '';
        }


        $command = $connection->createCommand("SELECT a.consultant_id, CONCAT(c.title_code,c.name) as consultant_name,
                (
                    SELECT COUNT(*)
                    FROM pat_appointment c
                    JOIN pat_encounter d
                    ON d.encounter_id = c.encounter_id
                    WHERE d.tenant_id = :tid
                    AND d.status = '1'
                    AND c.appt_status = 'B'
                    AND d.encounter_type = :ptype
                    $filterQuery
                    AND DATE(d.encounter_date) {$dtop} :enc_date
                    AND c.consultant_id = a.consultant_id
                ) AS booking,
                (
                    SELECT COUNT(*)
                    FROM pat_appointment c
                    JOIN pat_encounter d
                    ON d.encounter_id = c.encounter_id
                    WHERE d.tenant_id = :tid
                    AND d.status = '1'
                    AND c.appt_status = 'A'
                    AND d.encounter_type = :ptype
                    $filterQuery
                    AND DATE(d.encounter_date) {$dtop} :enc_date
                    AND c.consultant_id = a.consultant_id
                ) AS arrival,
                (
                    SELECT COUNT(*)
                    FROM pat_appointment c
                    JOIN pat_encounter d
                    ON d.encounter_id = c.encounter_id
                    WHERE d.tenant_id = :tid
                    AND d.status = '0'
                    AND c.appt_status = 'S'
                    AND d.encounter_type = :ptype
                    AND DATE(d.encounter_date) {$dtop} :enc_date
                    AND c.consultant_id = a.consultant_id
                ) AS seen
                FROM pat_appointment a
                JOIN pat_encounter b ON b.encounter_id = a.encounter_id
                JOIN co_user c ON c.user_id = a.consultant_id
                WHERE a.tenant_id = :tid
                AND b.encounter_type = :ptype
                $filterQuery1 $consultantQuery
                AND b.status IN ($eStatus)
                AND DATE(b.encounter_date) {$dtop} :enc_date
                $groupQuery", [':enc_date' => $params['date'], ':tid' => $params['tenant_id'], ':ptype' => 'OP']);

        $counts = $command->queryAll(\PDO::FETCH_OBJ);
        if ($counts) {
            foreach ($counts as $i => $v) {
                $booked = $v->booking - $v->arrival;
                $arrival = $v->arrival;
                $seen = $v->seen;

                if ($booked > 0 || $arrival > 0 || $seen > 0)
                    $consultants[$v->consultant_id] = [
                        'consultant_name' => $v->consultant_name,
                        'booked' => $booked,
                        'arrival' => $arrival,
                        'seen' => $seen
                    ];
            }
        }

        return $consultants;
    }

    protected function OPResults($params) {
//        Default condition
        $condition = [
            'pat_encounter.tenant_id' => $params['tenant_id'],
        ];

//        By Default Open Status
        $condition['pat_appointment.status'] = '1';
        if (@$params['seen'] == 'true') {
            $condition['pat_encounter.status'] = '0';
        } else if (@$params['seen'] == 'false') {
            $condition['pat_encounter.status'] = '1';
        }
        if (isset($params['month']) && @$params['month'] != 'undefined' && @$params['year'] != 'undefined' && isset($params['year'])) {
            $date = $params['year'] . '-' . $params['month'];
            ///echo date('m Y', strtotime($date)); die;
            $condition["DATE_FORMAT(pat_encounter.encounter_date,'%m %Y')"] = date('m Y', strtotime($date));
        } else {
            if (@$params['type'] == 'Future') {
                $condition["DATE_FORMAT(pat_encounter.encounter_date,'%m %Y')"] = date('m Y');
            }
        }

//        Check "View all doctors appointments".
        if ((is_numeric(@$params['cid']) && @$params['cid'] > 0) || (is_array($params['cid']) && !empty($params['cid']))) { //KEYWORD: COOKIE EXPAND
//        if (is_numeric(@$params['cid']) && @$params['cid'] > 0) {
            $condition['pat_appointment.consultant_id'] = $params['cid'];
        }

//        Encounter Date Condition
        $encDtCond = ['=', 'DATE(encounter_date)', $params['date']];
        if ((strtolower(@$params['type']) == 'previous') && (isset($params['range_filter_start']) && @$params['range_filter_start'] != 'undefined') && (isset($params['range_filter_end']) && @$params['range_filter_end'] != 'undefined')) {
            $encDtCond = ['between', 'DATE(encounter_date)', $params['range_filter_start'], $params['range_filter_end']];
            //$encDtCond = ['<', 'DATE(encounter_date)', $params['date']];
        } else if (@$params['type'] == 'Future') {
            $encDtCond = ['>', 'DATE(encounter_date)', $params['date']];
        }


        return PatEncounter::find()
                        ->joinWith('patAppointments')
                        ->addSelect([
                            '{{pat_encounter}}.*'
                        ])
                        ->where($condition)
                        ->encounterType("OP")
                        ->andWhere($encDtCond)
                        ->orderBy([
                            '{{pat_appointment}}.appt_status' => SORT_ASC,
                            '{{pat_appointment}}.status_time' => SORT_ASC,
                        ])
                        ->all();
    }

    public function actionOutpatientsold() {
        $get = Yii::$app->getRequest()->get();

        $date = date('Y-m-d');
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        //Default Current OP
        $query = "DATE(encounter_date) = '{$date}'";
        if (isset($get['type'])) {
            if ($get['type'] == 'Previous')
                $query = "DATE(encounter_date) < '{$date}'";
            else if ($get['type'] == 'Future')
                $query = "DATE(encounter_date) > '{$date}'";
        }

        $condition = [
//            'pat_encounter.status' => '1',
            'pat_encounter.tenant_id' => $tenant_id,
            'pat_appointment.consultant_id' => Yii::$app->user->identity->user->user_id,
            'pat_appointment.status' => '1',
        ];

        $seen_condition = [
            'pat_encounter.status' => '0',
            'pat_encounter.tenant_id' => $tenant_id,
            'pat_appointment.consultant_id' => Yii::$app->user->identity->user->user_id,
            'pat_appointment.appt_status' => 'S',
        ];

        //Check "View all doctors appointments".
        if (isset($get['all'])) {
            if ($get['all']) {
                $condition = [
//                    'pat_encounter.status' => '1',
                    'pat_encounter.tenant_id' => $tenant_id,
                    'pat_appointment.status' => '1',
                ];

                $seen_condition = [
                    'pat_encounter.status' => '0',
                    'pat_encounter.tenant_id' => $tenant_id,
                    'pat_appointment.appt_status' => 'S',
                ];
            }
        }

        $result = [];

        $data = PatEncounter::find()
                ->joinWith('patAppointments')
                ->where($condition)
                ->encounterType("OP")
                ->andWhere($query)
                ->groupBy('pat_appointment.consultant_id')
                ->orderBy([
                    'encounter_id' => SORT_ASC,
                ])
                ->all();

        foreach ($data as $key => $value) {
            $details = PatEncounter::find()
                    ->joinWith('patAppointments')
                    ->where($condition)
                    ->encounterType("OP")
                    ->andWhere($query)
                    ->andWhere(['pat_appointment.consultant_id' => $value['patAppointments'][0]['consultant_id']])
                    ->orderBy([
                        'encounter_date' => SORT_DESC,
                    ])
                    ->all();

            $seen_encounters = PatEncounter::find()
                    ->joinWith('patAppointments')
                    ->where($seen_condition)
                    ->encounterType("OP")
                    ->andWhere($query)
                    ->andWhere(['pat_appointment.consultant_id' => $value['patAppointments'][0]['consultant_id']])
                    ->orderBy([
                        'encounter_date' => SORT_DESC,
                    ])
                    ->count();

            $result[$key] = ['data' => $value, 'all' => $details, 'seen_count' => $seen_encounters];
        }
        return ['success' => true, 'result' => $result];
    }

    public function actionGetencounterlistbypatient() {
        $GET = Yii::$app->getRequest()->get();

        if (isset($GET['tenant']))
            $tenant = $GET['tenant'];

        if (isset($GET['status']))
            $status = strval($GET['status']);

        if (isset($GET['deleted']))
            $deleted = $GET['deleted'] == 'true';

        if (isset($GET['patient_id']))
            $patient_id = $GET['patient_id'];

        $encounter_type = 'IP,OP';
        if (isset($GET['encounter_type']))
            $encounter_type = $GET['encounter_type'];

        $oldencounter = '';
        if (isset($GET['old_encounter']))
            $oldencounter = $GET['old_encounter'];

        $limit = '';
        if (isset($GET['limit']))
            $limit = $GET['limit'];

        $model = PatEncounter::getEncounterListByPatient($tenant, $status, $deleted, $patient_id, $encounter_type, $oldencounter, $limit);

        return $model;
    }

    public function actionGetencounterlistbytenantsamepatient() {
        $GET = Yii::$app->getRequest()->get();

        if (isset($GET['tenant']))
            $tenant = $GET['tenant'];

        if (isset($GET['status']))
            $status = strval($GET['status']);

        if (isset($GET['deleted']))
            $deleted = $GET['deleted'] == 'true';

        if (isset($GET['patient_id']))
            $patient_id = $GET['patient_id'];

        $encounter_type = 'IP,OP';
        if (isset($GET['encounter_type']))
            $encounter_type = $GET['encounter_type'];

        $oldencounter = '';
        if (isset($GET['old_encounter']))
            $oldencounter = $GET['old_encounter'];

        $model = PatEncounter::getEncounterListByTenantSamePatient($tenant, $status, $deleted, $patient_id, $encounter_type, $oldencounter);

        return $model;
    }

    public function actionPatienthaveactiveencounter() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $patient = PatPatient::find()->where(['patient_guid' => $post['patient_id']])->one();
            $enc_type = isset($post['encounter_type']) ? $post['encounter_type'] : ['IP', 'OP'];
            $encounter = PatEncounter::find()
                    //->tenant()
                    ->andWhere(['encounter_type' => $enc_type])
                    ->andWhere(['patient_id' => $patient->patient_id])
                    ->orderBy(['status' => SORT_DESC]);

            $model = $encounter->one();

            if (!empty($model) && $model->isActiveEncounter()) {
                return ['success' => true, 'model' => $model, 'encounters' => $encounter->andWhere(['status' => '1'])->all()];
            } else {
                return ['success' => false];
            }
        }
    }

    public function actionPatienthaveunfinalizedencounter() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $patient = PatPatient::find()->where(['patient_guid' => $post['patient_id']])->one();
            $model = PatEncounter::find()
                    //->tenant()
                    //->unfinalized()
                    ->andWhere(['patient_id' => $patient->patient_id, 'encounter_id' => $post['encounter_id']])
                    ->one();

            if (!empty($model)) {
                return ['success' => true, 'model' => $model];
            } else {
                return ['success' => false];
            }
        }
    }

    public function actionAppointmentseenencounter() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $patient = PatPatient::find()->where(['patient_guid' => $post['patient_id']])->one();
            $model = PatEncounter::find()
                    ->tenant()
                    ->status('0')
                    ->andWhere(['patient_id' => $patient->patient_id])
                    ->andWhere(['encounter_id' => $post['enc_id']])
                    ->one();

            if (!empty($model)) {
                return ['success' => true, 'model' => $model];
            } else {
                return ['success' => false];
            }
        }
    }

    public function actionGetnonrecurringbilling() {
        $get = Yii::$app->getRequest()->get();

        $data = [];
        if (!empty($get) && $get['encounter_id']) {
            $encounter_id = $get['encounter_id'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $procedure = VBillingProcedures::find()->where(['encounter_id' => $encounter_id])->all();
            $consults = VBillingProfessionals::find()->where(['encounter_id' => $encounter_id])->all();
            $otherCharge = VBillingOtherCharges::find()->where(['encounter_id' => $encounter_id])->all();
            $advance = VBillingAdvanceCharges::find()->where(['encounter_id' => $encounter_id])->all();

            $data = array_merge($data, $this->_addNonrecurrNetAmount($procedure, 'Procedure', 'total_charge'), $this->_addNonrecurrNetAmount($consults, 'Consults', 'total_charge'), $this->_addNonrecurrNetAmount($otherCharge, 'OtherCharge', 'total_charge'), $this->_addNonrecurrNetAmount($advance, 'Advance', 'total_charge')
            );
        }
        return $data;
    }

    private function _addNonrecurrNetAmount($bills, $name, $charge_column) {
        $data[$name] = [];
        foreach ($bills as $key => $bill) {
            if ($key == 0) {
                $prev_amount = 0;
                $prev_concession_amount = 0;
            } else {
                $prev_amount = $data[$name][$key - 1]['net_amount'];
                $prev_concession_amount = $data[$name][$key - 1]['concession_net_amount'];
            }
            $data[$name][$key] = $bill->attributes;
//            $data[$name][$key]['net_amount'] = $prev_amount + ($bill->$charge_column + $bill->extra_amount - $bill->concession_amount);
            $data[$name][$key]['net_amount'] = $prev_amount + ($bill->$charge_column + $bill->extra_amount);
            $data[$name][$key]['concession_net_amount'] = $prev_concession_amount + $bill->concession_amount;
        }
        return $data;
    }

    private function _addNetAmount($bills, $name, $charge_column) {
        $data[$name] = [];
        foreach ($bills as $key => $bill) {
            $prev_amount = $key == 0 ? 0 : $data[$name][$key - 1]['net_amount'];
            $data[$name][$key] = $bill->attributes;
            $data[$name][$key]['net_amount'] = $prev_amount + $bill->$charge_column;
        }
        return $data;
    }

    public function actionGetrecurringbilling() {
        $get = Yii::$app->getRequest()->get();

        $data = [];
        if (!empty($get) && $get['encounter_id']) {
            $encounter_id = $get['encounter_id'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $recurrings = $this->_getBillingRecurring($encounter_id, $tenant_id);
            $data = $this->_addNetAmount($recurrings, 'recurring', 'total_charge');
        }
        return $data;
    }

    public function actionGetroomchargehistory() {
        $get = Yii::$app->getRequest()->get();

        $data = [];
        if (!empty($get) && $get['encounter_id']) {
            $encounter_id = $get['encounter_id'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $data['history'] = PatBillingRoomChargeHistory::find()->tenant()->status()->andWhere(['encounter_id' => $encounter_id])->all();
        }
        return $data;
    }

    public function actionUpdaterecurringroomcharge() {
        $post = Yii::$app->getRequest()->post();

        $data = [];
        if (!empty($post)) {
            $charge_hist = PatBillingRoomChargeHistory::find()->tenant()->andWhere(['charge_hist_id' => $post['charge_hist_id']])->one();

            if (empty($charge_hist))
                return;

            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $recurring_charges = PatBillingRecurring::find()
                    ->tenant()
                    ->status()
                    ->andWhere(['encounter_id' => $charge_hist->encounter_id, 'room_type_id' => $charge_hist->room_type_id, 'charge_item_id' => $charge_hist->charge_item_id])
                    ->andWhere(['between', 'recurr_date', $charge_hist->from_date, $charge_hist->org_to_date])
                    ->all();

            foreach ($recurring_charges as $key => $recurring_charge) {
                $recurring_charge->charge_amount = $charge_hist->charge;
                $recurring_charge->save(false);
            }

            $data['recurring'] = $this->_getBillingRecurring($charge_hist->encounter_id, $tenant_id);
            $charge_hist->delete();
        }
        return $data;
    }

    public function actionCancelroomchargehistory() {
        $post = Yii::$app->getRequest()->post();

        $data = [];
        if (!empty($post)) {
            $charge_hist = PatBillingRoomChargeHistory::find()->tenant()->andWhere(['charge_hist_id' => $post['charge_hist_id']])->one();

            if (empty($charge_hist))
                return;

            $tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $data['recurring'] = $this->_getBillingRecurring($charge_hist->encounter_id, $tenant_id);
            $charge_hist->delete();
        }
        return $data;
    }

    private function _getBillingRecurring($encounter_id, $tenant_id) {
        return VBillingRecurring::find()->where(['encounter_id' => $encounter_id])->orderBy(['from_date' => SORT_ASC, 'charge_item' => SORT_ASC])->all();
    }

    public function actionGetnonrecurringprocedures() {
        $get = Yii::$app->getRequest()->get();

        $data = [];
        if (!empty($get) && $get['encounter_id']) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $encounter_id = $get['encounter_id'];
            $category_id = $get['category_id'];
            $patient_id = $get['patient_id'];

            $data = VBillingProcedures::find()->where([
                        'encounter_id' => $encounter_id,
                        //'tenant_id' => $tenant_id,
                        'category_id' => $category_id,
                            //'patient_id' => $patient_id
                    ])->one();
        }
        return $data;
    }

    public function actionGetnonrecurringprofessionals() {
        $get = Yii::$app->getRequest()->get();

        $data = [];
        if (!empty($get) && $get['encounter_id']) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $encounter_id = $get['encounter_id'];
            $category_id = $get['category_id'];
            $patient_id = $get['patient_id'];

            $data = VBillingProfessionals::find()->where([
                        'encounter_id' => $encounter_id,
                        //'tenant_id' => $tenant_id,
                        'category_id' => $category_id,
                            //'patient_id' => $patient_id
                    ])->one();
        }
        return $data;
    }

    public function actionSavebillnote() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post) && $post['bill_notes'] != '') {
            $model = PatEncounter::find()->where(['encounter_id' => $post['encounter_id']])->one();
            if (!empty($model)) {
                $model->bill_notes = $post['bill_notes'];
                $model->save(false);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => 'Wrong entry'];
            }
        } else {
            return ['success' => false, 'message' => 'Please enter notes'];
        }
    }

    public function actionPatientlist() {
        $GET = Yii::$app->getRequest()->get();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $model = PatEncounter::find()
                //->tenant()
                ->andWhere([
                    'current_tenant_id' => $tenant_id,
                ])
                ->status()
                ->encounterType($GET['type']);
        if ($GET['type'] == 'IP') {
            $model->unfinalized();
        }
        if ($GET['type'] == 'OP') {
            $model->andFilterWhere(['DATE(encounter_date)' => date('Y-m-d')]);
        }
        $patient = $model->orderBy([
                    'encounter_date' => SORT_DESC,
                ])->all();
        return $patient;
    }

    public function actionGetpendingamount() {
        $get = Yii::$app->getRequest()->get();
        $encounters = VEncounter::find()
                ->where(['encounter_id' => $get['encounter_id']])
                ->groupBy('encounter_id')
                ->orderBy(['encounter_id' => SORT_DESC])
                ->all();
        foreach ($encounters as $k => $e) {
            $calculation = $e->encounter->viewChargeCalculation;
        }
        return $calculation;
    }

}
