<?php

namespace IRISADMIN\modules\v1\controllers;

use common\models\CoResources;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\HttpBearerAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class ResourceController extends ActiveController {

    public $modelClass = 'common\models\CoResources';

    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::className()
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

    public function actionGetparentresource() {
        $model = CoResources::find()->andWhere(['parent_id' => null])->all();

        if (!empty($model)) {
            return ['success' => true, 'model' => $model];
        } else {
            return ['success' => false, 'message' => 'Try Again Later'];
        }
    }

    public function actionGetchildresource() {
        $post = Yii::$app->request->post();
        $model = CoResources::find()->andWhere(['parent_id' => $post])->all();
        if (!empty($model)) {
            return ['success' => true, 'model' => $model];
        } else {
            return ['success' => false, 'message' => 'Try Again Later'];
        }
    }

}
