<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatPatientCasesheet;
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
class PatientcasesheetController extends ActiveController {

    public $modelClass = 'common\models\PatPatientCasesheet';

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

    public function actionCreatecasesheet() {
        $post = Yii::$app->getRequest()->post();

        $model = new PatPatientCasesheet();
        $model->attributes = $post;
        $valid = $model->validate();

        if ($valid) {
            $old = PatPatientCasesheet::find()->tenant()->status()->andWhere(['patient_id' => $post['patient_id']])->one();
            if (!empty($old)) {
                $old->attributes = $old;
                $old->status = 0;
                $old->end_date = date("Y-m-d");
                $old->save(false);
            }

            $model = new PatPatientCasesheet();
            $model->attributes = [
                'casesheet_no' => $post['casesheet_no'],
                'patient_id' => $post['patient_id'],
                'start_date' => date("Y-m-d"),
            ];
            $model->save(false);
            return ['success' => true];
        } else {
            return ['success' => false, 'message' => Html::errorSummary([$model])];
        }
    }

}
