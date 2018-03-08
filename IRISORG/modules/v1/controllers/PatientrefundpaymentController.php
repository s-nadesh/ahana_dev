<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatRefundPayment;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

class PatientrefundpaymentController extends ActiveController {

    public $modelClass = 'common\models\PatRefundPayment';

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
            'query' => $modelClass::find()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionGetrefundcharge() {
        $get = Yii::$app->getRequest()->get();
        $modelClass = $this->modelClass;
        if (!empty($get)) {
            $model = $modelClass::find()->where(['encounter_id' => $get['encounter_id']])->one();
            return ['model' => $model];
        }
    }

    public function actionIncreaseprintcount() {
        $get = Yii::$app->getRequest()->get();
        $modelClass = $this->modelClass;
        if (!empty($get)) {
            $model = $modelClass::find()->where(['encounter_id' => $get['encounter_id']])->one();
            $model->print_count = $model->print_count + 1;
            $model->save(false);
        }
    }

}
