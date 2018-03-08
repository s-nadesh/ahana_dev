<?php

namespace IRISORG\modules\v1\controllers;

use common\models\PatPrescriptionRoute;
use common\models\PhaDescriptionsRoutes;
use common\models\PhaProductDescription;
use Yii;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Expression;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * WardController implements the CRUD actions for CoTenant model.
 */
class PharmacyprodescController extends ActiveController {

    public $modelClass = 'common\models\PhaProductDescription';

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
            $model = PhaProductDescription::find()->where(['description_id' => $id])->one();
            $model->remove();
            $activity = 'Product Type Deleted Successfully (#' . $model->description_name . ' )';
            CoAuditLog::insertAuditLog(PhaProductDescription::tableName(), $id, $activity);
            return ['success' => true];
        }
    }

    public function actionAdddescriptionroutes() {
        $post = Yii::$app->request->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        if (!empty($post) && !empty($tenant_id)) {
            $description = new PhaProductDescription;
            if (isset($post['description_id']) && $post['description_id'] != '') {
                $description = PhaProductDescription::find()
                        ->where(['description_id' => $post['description_id']])
                        ->one();
            }
            $description->attributes = $post;

            $model = new PhaDescriptionsRoutes;
            $model->tenant_id = $tenant_id;
            $model->scenario = 'routeassign';
            $model->attributes = $post;

            $valid = $description->validate();
            $valid = $model->validate() && $valid;

            if ($valid) {
                $description->save(false);
                if (isset($post['description_id']) && $post['description_id'] != '') {
                    $description_result = $description;
                } else {
                    $description_result = PhaProductDescription::find()
                            ->where(['description_id' => $description->description_id])
                            ->one();
                }

                foreach ($post['route_ids'] as $route_id) {
                    $routes[] = PatPrescriptionRoute::find()->where(['route_id' => $route_id])->one();
                }

                // extra columns to be saved to the many to many table
                $extraColumns = ['tenant_id' => $tenant_id, 'created_by' => Yii::$app->user->identity->user_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()')];
                $unlink = true; // unlink tags not in the list
                $delete = true; // delete unlinked tags

                $description_result->linkAll('routes', $routes, $extraColumns, $unlink, $delete);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$description, $model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

}
