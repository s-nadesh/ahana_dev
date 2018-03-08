<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoUser;
use common\models\PatPatient;
use common\models\PatProcedure;
use common\models\CoAuditLog;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class ProcedureController extends ActiveController {

    public $modelClass = 'common\models\PatProcedure';

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
            $model = PatProcedure::find()->where(['proc_id' => $id])->one();
            $model->remove();
            $activity = 'Procedure Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatProcedure::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

//    public function actionGetprocedurebyencounter() {
//        $enc_id = Yii::$app->getRequest()->get('enc_id');
//
//        if (!empty($enc_id)) {
//            $model = PatProcedure::find()
//                    ->tenant()
//                    ->status()
//                    ->active()
//                    ->andWhere(['encounter_id' => $enc_id])
//                    ->orderBy([
//                        'proc_date' => SORT_DESC,
//                    ])
//                    ->all();
//        }
//
//        return $model;
//    }

    public function actionGetprocedurebyencounter() {
        $get = Yii::$app->getRequest()->get();
        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $result = [];
            $procedure = PatProcedure::find()
                    ->active()
                    ->status()
                    ->andWhere("patient_id IN ($all_patient_id->allpatient)");
            if (isset($get['date'])) {
                $procedure->andWhere(['DATE(proc_date)' => $get['date']]);
            }
            $data = $procedure->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->all();

            foreach ($data as $key => $value) {
                $procedure_details = PatProcedure::find()
                        ->active()
                        ->status()
                        ->andWhere("patient_id IN ($all_patient_id->allpatient)");
                if (isset($get['date'])) {
                    $procedure_details->andWhere(['DATE(proc_date)' => $get['date']]);
                }
                $details = $procedure_details->andWhere(['encounter_id' => $value->encounter_id])
                        ->orderBy(['proc_date' => SORT_DESC])
                        ->all();

                $result[$key] = ['data' => $value, 'all' => $details];
            }
            return ['success' => true, 'result' => $result];
        }
    }

    public function actionGetconsultantsbyprocedure() {
        $proc_id = Yii::$app->getRequest()->get('proc_id');

        $consultants = [];
        if (!empty($proc_id)) {
            $model = PatProcedure::find()->where(['proc_id' => $proc_id])->one();

            if (!empty($model->proc_consultant_ids)) {
                foreach ($model->proc_consultant_ids as $key => $id) {
                    $consultants[$key] = CoUser::find()->where(['user_id' => $id])->one();
                }
            }
        }

        return $consultants;
    }

    public function actionBulkinsert() {
        $post = Yii::$app->getRequest()->post();

        if (!empty($post)) {
            foreach ($post['procedures_done'] as $key => $value) {
                $pat_procedure = new PatProcedure;

                $pat_procedure->encounter_id = $value['encounter_id'];
                $pat_procedure->patient_id = $value['patient_id'];
                $pat_procedure->charge_subcat_id = $post['data']['charge_subcat_id'];
                $pat_procedure->proc_date = $post['data']['proc_date'];
                $pat_procedure->proc_consultant_ids = $post['data']['proc_consultant_ids'];
                if (!empty($value['notes']))
                    $pat_procedure->proc_description = $value['notes'];
                $pat_procedure->save(false);
            }
            return ['success' => true];
        }
    }

    public function actionGetprocedureencounter() {
        $post = Yii::$app->getRequest()->post();
        if (!empty($post)) {
            $procedure = PatProcedure::find()
                    ->tenant()
                    ->active()
                    ->status()
                    ->andWhere(['encounter_id' => $post['enc_id']])
                    ->orderBy(['proc_date' => SORT_DESC])
                    ->all();
            return ['procedure' => $procedure];
        }
    }

}
