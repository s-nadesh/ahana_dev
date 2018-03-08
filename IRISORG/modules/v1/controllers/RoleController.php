<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoRole;
use common\models\CoAuditLog;
use common\models\CoUsersRoles;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\filters\Cors;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * RoleController implements the CRUD actions for CoTenant model.
 */
class RoleController extends ActiveController {

    public $modelClass = 'common\models\CoRole';

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
            'query' => $modelClass::find()->tenant()->active()->exceptSuperRole()->orderBy(['created_at' => SORT_DESC]),
            'pagination' => false,
        ]);
    }

    public function actionCreaterole() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = new CoRole();
            $model->attributes = $post;

            $valid = $model->validate();
            if ($valid) {
                $model->save(false);

                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionUpdaterole() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = CoRole::findOne($post['role_id']);
            $model->attributes = $post;

            $valid = $model->validate();

            if ($valid) {
                $model->save(false);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionGetrole() {
        $id = Yii::$app->request->get('id');
        if (!empty($id)) {
            $data = CoRole::findOne($id);
            $return = $this->excludeColumns($data->attributes);
            return ['success' => true, 'return' => $return];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    //role_rights.js, user_roles.js
    public function actionGetactiverolesbyuser() {
        $roles = CoRole::find()->tenant()->active()->status()->exceptSuperRole()->all();
        return ['success' => true, 'roles' => $roles];
    }

    public function actionGetmyroles() {
        $id = Yii::$app->request->get('id');
        if (!empty($id)) {
            $roles = CoUsersRoles::find()->tenant()->andWhere(['user_id' => $id])->all();
//            $roles = ArrayHelper::map($data, 'role_id', 'role_id');
            return ['success' => true, 'roles' => $roles];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    protected function excludeColumns($attrs) {
        $exclude_cols = ['created_by', 'created_at', 'modified_by', 'modified_at'];
        foreach ($attrs as $col => $val) {
            if (in_array($col, $exclude_cols))
                unset($attrs[$col]);
        }
        return $attrs;
    }

    public function actionRemove() {
        $id = Yii::$app->getRequest()->post('id');
        if ($id) {
            $model = CoRole::find()->where(['role_id' => $id])->one();
            $model->remove();
            $activity = "Roles Deleted Successfully (#$model->description)";
            CoAuditLog::insertAuditLog(CoRole::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

}
