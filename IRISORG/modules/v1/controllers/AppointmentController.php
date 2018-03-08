<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatAppointment;
use common\models\PatEncounter;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class AppointmentController extends ActiveController {

    public $modelClass = 'common\models\PatAppointment';

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

    public function actionChangestatus() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $appt_model = new PatAppointment();
            $appt_model->scenario = 'seen_status';
            $appt_model->attributes = $post;
            $valid = $appt_model->validate();

            if ($valid) {
                $amount = $appt_model->amount;
                $amount_words = Yii::$app->hepler->convert_number_to_words((int) ($amount)) . ' Rupees Only';

                $appt_model->save(false);
                if(isset($post['future_status_date']) && isset($post['future_status_time']) && isset($post['future_consultant_id']) && $post['future_status_date'] != '' && $post['future_status_time'] != '' && $post['future_consultant_id'] != ''){
                    $this->bookFutureapt($post);
                }
                
                return ['success' => true, 'amount_in_words' => $amount_words, 'bill_no' => $appt_model->encounter->bill_no];
            } else {
                return ['success' => false, 'message' => Html::errorSummary($appt_model)];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }
    
    // Booking from change status form.
    private function bookFutureapt($post) {
        if (!empty($post)) {
            $model = new PatEncounter();
            $appt_model = new PatAppointment();
            
            $encounter_date = $post['future_status_date'].' '.$post['future_status_time'];

            $model_attr = [
                'patient_id' => (isset($post['patient_id']) ? $post['patient_id'] : ''),
                'encounter_type' => 'OP',
                'encounter_date' => $encounter_date,                
                'consultant_id' => @$post['future_consultant_id']
            ];
            $model->attributes = $model_attr;
            
            $appt_attr = [
                'patient_id' => (isset($post['patient_id']) ? $post['patient_id'] : ''),
                'appt_status' => 'B',
                'status_date' => $post['future_status_date'],                
                'status_time' => $post['future_status_time'],                
                'consultant_id' => @$post['future_consultant_id']
            ];
            $appt_model->attributes = $appt_attr;

            $valid = $model->validate();
            $valid = $appt_model->validate() && $valid;
            
            if ($valid) {
                $model->save(false);
                $appt_model->encounter_id = $model->encounter_id;
                $appt_model->save(false);
                return true;
            } 
        }
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PatAppointment::find()->where(['city_id' => $id])->one();
            $model->remove();
            return ['success' => true];
        }
    }

    public function actionBulkcancel() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            foreach ($post as $key => $value) {
                $data = array();
                $data['appt_status'] = "C";
                $data['encounter_id'] = $value['encounter_id'];
                $data['status_time'] = date("H:i:s");
                $data['status_date'] = date("Y-m-d");
                $data['patient_id'] = $value['patient_id'];

                $model = new PatAppointment;
                $model->attributes = $data;
                $model->save(false);
            }
        }
    }

    public function actionBulkreschedule() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            foreach ($post['appointments'] as $key => $value) {
                $appointment = PatAppointment::find()->where(['appt_id' => $value['appt_id']])->one();
                //Cancel Old appointment informations
                $data = array();
                $data['appt_status'] = "C";
                $data['encounter_id'] = $appointment->encounter_id;
                $data['status_time'] = date("H:i:s");
                $data['status_date'] = date("Y-m-d");
                $data['patient_id'] = $appointment->patient_id;

                $model = new PatAppointment;
                $model->attributes = $data;
                $model->save(false);

                //Create New Enconter and Book.
                $en_model = new PatEncounter();
                $appt_model = new PatAppointment();
                $encounter_date = $post['data']['status_date'].' '.$value['status_time'];
                
                $model_attr = [
                    'patient_id' => $appointment->patient_id,
                    'encounter_type' => 'OP',
                    'encounter_date' => $encounter_date,
                    'add_casesheet_no' => '',
                    'consultant_id' => @$post['data']['consultant_id']
                ];
                $en_model->attributes = $model_attr;
                $en_model->save(false);

                $appt_model->encounter_id = $en_model->encounter_id;
                $appt_model->status_time = $value['status_time'];
                $appt_model->status_date = $post['data']['status_date'];
                $appt_model->consultant_id = $post['data']['consultant_id'];
                $appt_model->appt_status = "B";
                $appt_model->patient_id = $appointment->patient_id;
                $appt_model->save(false);
            }
        }
    }

    public function actionGetfutureappointments() {
        $future_appointments = PatAppointment::getFutureAppointments();
        return $future_appointments;
    }

    public function actionGetfutureappointmentslist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['consultant_id']) && isset($get['date'])) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $result = [];
            $data = PatAppointment::find()
                    ->joinWith('encounter')
                    ->where([
                        'consultant_id' => $get['consultant_id'],
                        'status_date' => $get['date'],
                        'appt_status' => 'B',
                        'pat_encounter.status' => '1',
                        'pat_encounter.tenant_id' => $tenant_id
                    ])
                    ->groupBy('consultant_id')
                    ->orderBy(['status_date' => SORT_ASC])
                    ->all();

            foreach ($data as $key => $value) {
                $details = PatAppointment::find()
                        ->joinWith('encounter')
                        ->where([
                            'consultant_id' => $value->consultant_id,
                            'status_date' => $value->status_date,
                            'appt_status' => 'B',
                            'pat_encounter.status' => '1',
                            'pat_encounter.tenant_id' => $tenant_id
                        ])
                        ->orderBy(['status_date' => SORT_ASC])
                        ->all();

                $result[$key] = ['data' => $value, 'all' => $details];
            }
            return ['success' => true, 'result' => $result];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

}
