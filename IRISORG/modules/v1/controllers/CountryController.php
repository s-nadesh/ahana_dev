<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoMasterCountry;
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
class CountryController extends ActiveController {

    public $modelClass = 'common\models\CoMasterCountry';

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
            'query' => $modelClass::find()->tenantWithNull()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }
    
    public function actionChangeStatus() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $modelName = $post['model'];
            $primaryKey = $post['id'];
            $modelClass = "common\\models\\$modelName";
            $model = $modelClass::findOne($primaryKey);
            $model->status = 1 - $model->status;
            $model->save(false);
            return ['success' => "ok", 'sts' => $model->status];
        }
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = CoMasterCountry::find()->where(['country_id' => $id])->one();
            $model->remove();
            $activity = 'Country Deleted Successfully (#' . $model->country_name . ' )';
            CoAuditLog::insertAuditLog(CoMasterCountry::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

}
