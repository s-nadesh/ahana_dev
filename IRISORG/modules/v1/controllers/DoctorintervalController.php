<?php

namespace IRISORG\modules\v1\controllers;
use common\models\CoDoctorInterval;

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
class DoctorintervalController extends ActiveController {

    public $modelClass = 'common\models\CoDoctorInterval';

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

    public function actionSetintervaltime() {
        $post = Yii::$app->getRequest()->post();
        $interval_attr = [
            'user_id' => $_GET['userid'],
            'interval' => $post['interval'],
        ];
        $new_interval = new CoDoctorInterval();
        $interval = CoDoctorInterval::find()->tenant()->active()->andWhere(['user_id' => $_GET['userid']])->one();
        if (!empty($interval)) {
            $new_interval = $interval;
        }
        $new_interval->attributes = $interval_attr;
        $new_interval->save();
    }

}
