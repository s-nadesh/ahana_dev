<?php

namespace IRISORG\modules\v1\controllers;

use Yii;
use common\models\PatResult;
use common\models\PatPatient;
use common\models\CoAuditLog;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PatientresultsController extends ActiveController {

    public $modelClass = 'common\models\PatResult';

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

    public function actionGetpatientresults() {
        $get = Yii::$app->getRequest()->get();
        
        if (!empty($get)) {
            $patient = PatPatient::getPatientByGuid($get['patient_id']);

            $all_patient_id = PatPatient::find()
                    ->select('GROUP_CONCAT(patient_id) AS allpatient')
                    ->where(['patient_global_guid' => $patient->patient_global_guid])
                    ->one();

            $result = [];
            $data = PatResult::find()
                    ->active()
                    ->status()
                    ->where("patient_id IN ($all_patient_id->allpatient)")
                    ->groupBy('encounter_id')
                    ->orderBy(['encounter_id' => SORT_DESC])
                    ->all();

            foreach ($data as $key => $value) {
                $details = PatResult::find()
                        ->active()
                        ->status()
                        ->where("patient_id IN ($all_patient_id->allpatient)")
                        ->andWhere(['encounter_id' => $value->encounter_id])
                        ->orderBy(['pat_result_id' => SORT_DESC])
                        ->all();
                $result[$key] = ['data' => $value, 'all' => $details];
            }
            return ['success' => true, 'result' => $result];
        }
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PatResult::find()->where(['pat_result_id' => $id])->one();
            $model->remove();
            $activity = 'Patient Results Deleted Successfully (#' . $model->encounter_id . ' )';
            CoAuditLog::insertAuditLog(PatResult::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

}
