<?php

namespace IRISORG\modules\v1\controllers;

use common\models\AppConfiguration;
use common\models\CoOrganization;
use common\models\CoResources;
use common\models\CoRole;
use common\models\CoRolesResources;
use common\models\CoTenant;
use common\models\CoUsersRoles;
use common\models\GlPatientShareResources;
use common\models\GlPatientTenant;
use common\models\PatPatient;
use common\models\CoOrgSetting;
use Yii;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * OrganizationController implements the CRUD actions for CoTenant model.
 */
class OrganizationController extends ActiveController {

    public $modelClass = 'common\models\CoTenant';

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

    //org_module.js
    public function actionGetorgmodules() {
        $user_id = Yii::$app->user->identity->user->user_id;
        $user_role = CoUsersRoles::find()->tenant()->where(['user_id' => $user_id])->one();
        $role_resources = CoRolesResources::find()->tenant()->andWhere(['role_id' => $user_role->role_id])->all();
        return ['success' => true, 'modules' => $role_resources];
    }

    //role_rights.js
    public function actionGetorg() {
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
//        $access_tenant_id = Yii::$app->user->identity->access_tenant_id;

        $user = Yii::$app->user->identity->user;
        //Super Admin
        if ($user->tenant_id == 0) {
            $access_tenant_id = $user->first_tenant_id;
            $tenant_super_role = CoRole::getTenantSuperRole($access_tenant_id);
            $tenant_super_role_id = $tenant_super_role->role_id;
        } else {
            $access_tenant_id = $user->tenant_id;
            $user_roles = CoUsersRoles::find()->where(['user_id' => $user->user_id, 'tenant_id' => $access_tenant_id])->all();
            $tenant_super_role_id = \yii\helpers\ArrayHelper::map($user_roles, 'role_id', 'role_id');
        }

        if (!empty($tenant_id)) {
            $return = array();
            $organization = CoTenant::find()->where(['tenant_id' => $tenant_id])->one();
            return ['success' => true, 'return' => $organization, 'modules' => CoRolesResources::getOrgModuleTree($access_tenant_id, $tenant_super_role_id)];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    //role_rights.js
    public function actionGetorgmodulesbyrole() {
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
//        $tenant_super_role = CoRole::getTenantSuperRole($tenant_id);
//        $tenant_super_role_id = $tenant_super_role->role_id;
        //Super Admin
        $user = Yii::$app->user->identity->user;
        if ($user->tenant_id == 0) {
            $access_tenant_id = $user->first_tenant_id;
            $tenant_super_role = CoRole::getTenantSuperRole($access_tenant_id);
            $tenant_super_role_id = $tenant_super_role->role_id;
        } else {
            $access_tenant_id = $user->tenant_id;
            $user_roles = CoUsersRoles::find()->where(['user_id' => $user->user_id, 'tenant_id' => $access_tenant_id])->all();
            $tenant_super_role_id = \yii\helpers\ArrayHelper::map($user_roles, 'role_id', 'role_id');
        }

        $post = Yii::$app->request->post();

        if (!empty($post)) {
            $role_id = Yii::$app->request->post('role_id');
            $modules = CoRolesResources::getOrgModuletreeByRole($access_tenant_id, $tenant_super_role_id, $role_id, $tenant_id);

            return ['success' => true, 'modules' => $modules];
        }
    }

    //role_rights.js
    public function actionUpdaterolerights() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            if (Yii::$app->request->post('Module')) {
                if (!empty(Yii::$app->request->post('Module')['role_id'])) {
                    $resource_id = Yii::$app->request->post('Module')['resource_ids'];
                    $model = CoRole::findOne(['role_id' => Yii::$app->request->post('Module')['role_id']]);

                    $resources = CoResources::find()->where(['in', 'resource_id', $resource_id])->all();

                    // extra columns to be saved to the many to many table
                    $extraColumns = ['tenant_id' => Yii::$app->user->identity->logged_tenant_id, 'created_by' => Yii::$app->user->identity->user_id, 'status' => '1', 'role_id' => Yii::$app->request->post('Module')['role_id']];

                    $unlink = true; // unlink tags not in the list
                    $delete = true; // delete unlinked tags
                    $model->linkAll('resources', $resources, $extraColumns, $unlink, $delete);

                    return ['success' => true];
                } else {
                    return ['success' => false, 'message' => "Please select role"];
                }
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionUpdatesharing() {
        $post = Yii::$app->request->post();
        $org_id = Yii::$app->user->identity->user->org_id;

        $unset_configs = CoOrgSetting::updateAll(['value' => '0'], "org_id = {$org_id} AND `key` like '%SHARE_%'");

        if (isset($post['share'])) {
            $share_resources = array_keys($post['share']);
            $set_configs = CoOrgSetting::updateAll(['value' => '1'], ['org_id' => $org_id, 'code' => $share_resources]);
        }
        return ['success' => true];
    }

    public function actionGetshareorglist() {
        $organizations = CoOrganization::find()->all();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        $ret = [];
        foreach ($organizations as $key => $organization) {
            $ret[$key]['org_id'] = $organization->org_id;
            $ret[$key]['org_name'] = $organization->org_name;

            foreach ($organization->coTenants as $key_2 => $tenant) {
                if ($tenant_id != $tenant->tenant_id) {
                    $ret[$key]['branch'][$key_2]['tenant_id'] = $tenant->tenant_id;
                    $ret[$key]['branch'][$key_2]['tenant_name'] = $tenant->tenant_name;
                }
            }
        }
        return ['success' => true, 'org' => $ret];
    }

    public function actionGetpatientshareresources() {
        $get = Yii::$app->request->get();

        if (isset($get['patient_id'])) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $org_id = Yii::$app->user->identity->user->org_id;

            $patient = PatPatient::find()->where(['patient_guid' => $get['patient_id']])->one();
            $pat_share_attr = [
                //'tenant_id' => $tenant_id,
                'org_id' => $org_id,
                'patient_global_guid' => $patient->patient_global_guid
            ];

            $resources = GlPatientShareResources::find()->where($pat_share_attr)->all();
//            $list = ArrayHelper::map($resources, 'resource', 'resource');

            return ['success' => true, 'resources' => $resources];
        }
    }

    public function actionUpdatepatientsharing() {
        $post = Yii::$app->request->post();

        if (isset($post['patient_id'])) {
            $share_resources = $post['share'];
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $org_id = Yii::$app->user->identity->user->org_id;

            $patient = PatPatient::find()->where(['patient_guid' => $post['patient_id']])->one();
            $pat_share_attr = [
                //'tenant_id' => $tenant_id,
                'org_id' => $org_id,
                'patient_global_guid' => $patient->patient_global_guid
            ];

            GlPatientShareResources::deleteAll($pat_share_attr);

            foreach ($share_resources as $share_resource) {
                $patient_share = new GlPatientShareResources;
                $pat_share_attr['resource'] = $share_resource;
                $patient_share->attributes = $pat_share_attr;
                $patient_share->save(false);
            }
        }
        return ['success' => true];
    }

    public function actionGetpatientsharetenants() {
        $get = Yii::$app->request->get();

        if (isset($get['patient_id'])) {
            $tenant_id = Yii::$app->user->identity->logged_tenant_id;
            $patient = PatPatient::find()->where(['patient_guid' => $get['patient_id']])->one();
            $tenants = GlPatientTenant::find()->where(['patient_global_guid' => $patient->patient_global_guid])->all();

            return ['success' => true, 'tenants' => $tenants, 'tenant_id' => $tenant_id];
        }
    }

    public function actionGetorgbranches() {
        $branches = CoTenant::find()
                ->active()
                ->status()
                ->andWhere(['org_id' => Yii::$app->user->identity->user->org_id])
                ->all();
        return ['success' => true, 'branches' => $branches];
    }

}
