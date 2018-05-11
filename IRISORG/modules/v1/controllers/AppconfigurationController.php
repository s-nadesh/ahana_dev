<?php

namespace IRISORG\modules\v1\controllers;

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
class AppconfigurationController extends ActiveController {

    public $modelClass = 'common\models\AppConfiguration';

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
            'query' => $modelClass::find()->tenant()->active()->orderBy(['config_id' => SORT_ASC]),
            'pagination' => false,
        ]);
    }

    public function actionGetpresstatus() {
        $modelClass = $this->modelClass;
        $get = Yii::$app->getRequest()->get();
        return $modelClass::getConfigurationByKey($get['key']);
    }

    public function actionGetpresstatusbycode() {
        $modelClass = $this->modelClass;
        $get = Yii::$app->getRequest()->get();
        return $modelClass::getConfigurationBycode($get['code']);
    }

    public function actionGetpresstatusbygroup() {
        $modelClass = $this->modelClass;
        $get = Yii::$app->getRequest()->get();
        return $modelClass::getConfigurationBygroup($get['group']);
    }

    public function actionUpdatebykey() {
        $modelClass = $this->modelClass;
        $post = Yii::$app->getRequest()->post();
        $vitals = "'" . implode("','", $post['vitalkey']) . "'";
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $update_value = $post['vitalvalue'];

        $modelClass::updateAll(['value' => "$update_value"], "`key` IN ($vitals) AND tenant_id=$tenant_id");
        return ['success' => true];
    }

    public function actionUpdatepharmacybranch() {
        $post = Yii::$app->getRequest()->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $appConfig = $this->modelClass::find()
                        ->tenant()
                        ->andWhere([
                            'code' => 'PB'
                        ])->one();
        if (empty($appConfig)) {
            $configuration = new $this->modelClass;
            $configuration->tenant_id = $tenant_id;
            $configuration->code = 'PB';
        } else {
            $configuration = $appConfig;
        }
        $val = $post['value'];
        $configuration->value = "$val";
        $configuration->status = 1;
        $configuration->save();
        UserController::Clearpharmacysetupsession();
        UserController::Setuppharmacysession($tenant_id);
        return ['success' => true];
    }

    public function actionUpdateopbillsettings() {
        $post = Yii::$app->getRequest()->post();
        $appConfig = $this->modelClass::find()
                        ->tenant()
                        ->andWhere([
                            'code' => $post['code']
                        ])->one();
        $appConfig->value = $post['value'];
        $appConfig->save(false);
        return ['success' => true];
    }

}
