<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoUser;
use common\models\PatPatient;
use common\models\PatVitals;
use common\models\PatVitalsUsers;
use common\models\CoAuditLog;
use common\models\AppConfiguration;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Expression;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientvitalsController extends ActiveController {

    public $modelClass = 'common\models\PatVitals';

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
            $model = PatVitals::find()->where(['vital_id' => $id])->one();
            $model->remove();
            $activity = 'Vital Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatVitals::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionGetpatientvitals() {
        $GET = Yii::$app->getRequest()->get();
        $user_id = Yii::$app->user->identity->user->user_id;

        if (!empty($GET)) {

            $patient = PatPatient::getPatientByGuid($GET['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $only = $result = $uservitals = [];
            $HaveActEnc = false;
            if (isset($GET['only'])) {
                $only = explode(',', $GET['only']);
            }

            if (!$only || in_array('result', $only)) {
                $vitals = PatVitals::find()
                        ->where("patient_id IN ($all_patient_id->allpatient)")
                        ->active()
                        ->status();
                if (isset($GET['date'])) {
                    $vitals->andWhere(['DATE(vital_time)' => $GET['date']]);
                }
                $data = $vitals->orderBy(['vital_id' => SORT_DESC])
                        ->all();

                $result = array_values(\yii\helpers\ArrayHelper::index($data, null, ['encounter_id', function($element) {
                                return 'all';
                            }]));
            }

            if (!$only || in_array('actenc', $only)) {
                $HaveActEnc = (bool) $patient->patActiveEncounter;
            }

//            foreach ($data as $key => $value) {
//                $details = PatVitals::find()
//                        ->tenant()
//                        ->active()
//                        ->status()
//                        ->andWhere($condition)
//                        ->andWhere(['encounter_id' => $value->encounter_id])
//                        ->orderBy(['vital_id' => SORT_DESC])
//                        ->all();
//                $result[$key] = ['data' => $value, 'all' => $details];
//            }

            if (!$only || in_array('uservitals', $only)) {
                $uservitals = PatVitalsUsers::find()
                        ->tenant()
                        ->andWhere(['user_id' => $user_id, 'seen' => '0', 'patient_id' => $patient->patient_id])
                        ->all();
            }

            return ['success' => true, 'result' => $result, 'uservitals' => $uservitals, 'HaveActEnc' => $HaveActEnc];
        }
    }

    public function actionAssignvitals() {
        $post = Yii::$app->request->post();
        $user_id = Yii::$app->user->identity->user->user_id;
        $tenant_id = Yii::$app->user->identity->user->tenant_id;

        $user = CoUser::find()->where(['user_id' => $user_id])->one();
        $patient = PatPatient::getPatientByGuid($post['patient_guid']);
        $vitals = PatVitals::find()->tenant()->active()->andWhere(['patient_id' => $patient->patient_id])->andWhere("created_by != $user_id")->all();

        $extraColumns = ['tenant_id' => $tenant_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()'), 'patient_id' => $patient->patient_id]; // extra columns to be saved to the many to many table
        $unlink = true; // unlink tags not in the list
        $delete = true; // delete unlinked tags
        $user->linkAll('vitals', $vitals, $extraColumns, $unlink, $delete);
        return ['success' => true];
    }

    public function actionSeenvitals() {
        $post = Yii::$app->request->post();
        $user_id = Yii::$app->user->identity->user->user_id;
        $ids = implode(',', $post['ids']);

        $patient = PatPatient::getPatientByGuid($post['patient_guid']);
        $vitals = PatVitals::find()->tenant()->active()->andWhere(['patient_id' => $patient->patient_id])->orderBy(['created_at' => SORT_DESC])->all();

        PatVitalsUsers::updateAll(['seen' => '1'], "user_id = :user_id AND vital_id IN ($ids) AND patient_id = :patient_id", [
            ':user_id' => $user_id,
            ':patient_id' => $patient->patient_id
        ]);
        return ['success' => true];
    }

    public function actionBulkinsert() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            foreach ($post['patientdata'] as $value) {
                $model = new PatVitals();
                $model->attributes = $post;
                $model->encounter_id = $value['encounter_id'];
                $model->patient_id = $value['patient_id'];
                $model->save(false);
            }
            return ['success' => true];
        }
    }

    public function actionCheckvitalaccess() {
        $get = Yii::$app->request->get();
        if (isset($get['patient_type'])) {
            $pat_share_attr = [
                'like', 'key', $get['patient_type'] . '_V_',
            ];
            $vitals = AppConfiguration::find()->tenant()->andWhere($pat_share_attr)->all();
            return $vitals;
        }
        return '';
    }

    public function actionGetvitalsgraph() {
        $get = Yii::$app->request->get();
        $patient = PatPatient::getPatientByGuid($get['patient_id']);
        $patient_id = $patient->patient_id;

        $temperature = PatVitals::find()->tenant()->active()->status()->andWhere(['patient_id' => $patient_id])
                ->andWhere(['not', ['temperature' => null]])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        $bp = PatVitals::find()->tenant()->active()->status()
                ->andWhere(['patient_id' => $patient_id])
                ->andWhere(['or',
                        ['not', ['blood_pressure_systolic' => null]],
                        ['not', ['blood_pressure_diastolic' => null]],
                ])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        $pulse = PatVitals::find()->tenant()->active()->status()->andWhere(['patient_id' => $patient_id])
                ->andWhere(['not', ['pulse_rate' => null]])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        $weight = PatVitals::find()->tenant()->active()->status()->andWhere(['patient_id' => $patient_id])
                ->andWhere(['not', ['weight' => null]])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        $height = PatVitals::find()->tenant()->active()->status()->andWhere(['patient_id' => $patient_id])
                ->andWhere(['not', ['height' => null]])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        $sp02 = PatVitals::find()->tenant()->active()->status()->andWhere(['patient_id' => $patient_id])
                ->andWhere(['not', ['sp02' => null]])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        $painScore = PatVitals::find()->tenant()->active()->status()->andWhere(['patient_id' => $patient_id])
                ->andWhere(['not', ['pain_score' => null]])
                ->orderBy(['vital_id' => SORT_DESC])
                ->limit(5)
                ->all();
        return ['success' => true, 'temperature' => $temperature, 'bp' => $bp, 'pulse' => $pulse,
            'weight' => $weight, 'height' => $height, 'sp02' => $sp02, 'painScore' => $painScore];
    }

    public function actionGetvitalsbyencounter() {
        $get = Yii::$app->request->get();
        if (!empty($get['encounter_id'])) {
            $vitals = PatVitals::find()->tenant()->active()->andWhere(['encounter_id' => $get['encounter_id']])->orderBy(['created_at' => SORT_DESC])->one();
            if (!empty($vitals)) {
                return ['success' => true, 'vitals' => $vitals];
            } else {
                return ['success' => false];
            }
        } else {
            return ['success' => false];
        }
    }

}
