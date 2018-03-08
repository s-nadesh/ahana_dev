<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PhaHsn;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * HsnController implements the CRUD actions for CoTenant model.
 */
class HsnController extends ActiveController {

    public $modelClass = 'common\models\PhaHsn';

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
            'query' => $modelClass::find()->active()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionGethsncodelist() {
        $get = Yii::$app->getRequest()->get();

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        return ['hsncodeList' => PhaHsn::getHsnCodeList($status, $deleted)];
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = PhaHsn::find()->where(['hsn_id' => $id])->one();
            $model->remove();
            $activity = 'Hsn Deleted Successfully (#' . $model->hsn_no . ' )';
            CoAuditLog::insertAuditLog(PhaHsn::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

}
