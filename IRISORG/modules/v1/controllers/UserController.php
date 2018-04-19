<?php

namespace IRISORG\modules\v1\controllers;

use common\models\CoLogin;
use common\models\CoResources;
use common\models\CoRole;
use common\models\CoRolesResources;
use common\models\CoTenant;
use common\models\CoUser;
use common\models\CoUsersBranches;
use common\models\CoUsersRoles;
use common\models\LoginForm;
use common\models\PasswordResetRequestForm;
use common\models\PatEncounter;
use common\models\PatTimeline;
use common\models\ResetPasswordForm;
use common\models\CoAuditLog;
use IRISORG\models\ContactForm;
use Yii;
use yii\base\InvalidParamException;
use yii\data\ActiveDataProvider;
use yii\db\BaseActiveRecord;
use yii\db\Expression;
use yii\filters\auth\QueryParamAuth;
use yii\filters\ContentNegotiator;
use yii\helpers\ArrayHelper;
use yii\helpers\Html;
use yii\rest\ActiveController;
use yii\web\Response;

/**
 * User controller
 */
class UserController extends ActiveController {

    public $modelClass = 'common\models\CoUser';

    /**
     * @inheritdoc
     */
    public function behaviors() {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => QueryParamAuth::className(),
            'only' => ['dashboard', 'createuser', 'updateuser', 'getuser', 'getlogin', 'updatelogin', 'getuserdata', 'getuserslistbyuser', 'assignroles', 'assignbranches', 'getmybranches', 'getswitchedbrancheslist', 'getdoctorslist', 'getdoctorslistforpatient', 'checkstateaccess', 'getusercredentialsbytoken', 'passwordauth', 'changepassword', 'changeusertimeout'],
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

    public function actionWelcome() {
        $post = Yii::$app->request->post();
        $login = CoLogin::find()->where(['user_id' => $post['user_id']])->one();
        if ($post['today_date'] > $post['stay_date']) {
            $login->attributes = ['authtoken' => '', 'logged_tenant_id' => ''];
            $login->save(false);
            return false;
        } else {
            if (md5($login->authtoken) == $_GET['access-token']) {
                return true;
            } else {
                $login->attributes = ['authtoken' => '', 'logged_tenant_id' => ''];
                $login->save(false);
                return false;
            }
        }
    }

//    public function actionGetuserdata() {
//        $get = Yii::$app->request->get();
//        if (isset($get['cp']) && $get['cp'] == 'C') {
//            $model = CoUser::find()
//                    ->active()
//                    ->exceptSuperUser()
//                    ->andWhere(['care_provider' => '1'])
//                    ->orderBy(['created_at' => SORT_DESC])
//                    ->all();
//        } else {
//            $model = CoUser::find()->active()->exceptSuperUser()->orderBy(['created_at' => SORT_DESC])->all();
//        }
//        $data = [];
//        foreach ($model as $key => $user) {
//            $data[$key] = $user->attributes;
//            if (empty($user->login)) {
//                $data[$key]['login_link_btn'] = 'btn btn-sm btn-info';
//                $data[$key]['login_link_text'] = 'Create';
//                $data[$key]['login_link_icon_class'] = 'fa-plus';
//                $data[$key]['username'] = '-';
//                $data[$key]['activation_date'] = '-';
//                $data[$key]['Inactivation_date'] = '-';
//            } else {
//                $data[$key]['login_link_btn'] = 'btn btn-sm btn-primary';
//                $data[$key]['login_link_text'] = 'Update';
//                $data[$key]['login_link_icon_class'] = 'fa-pencil';
//                $data[$key]['username'] = $user->login->username;
//                $data[$key]['activation_date'] = $user->login->activation_date;
//                $data[$key]['Inactivation_date'] = $user->login->Inactivation_date;
//            }
//        }
//        return $data;
//    }

    public function actionGetuserdata() {

        $get = Yii::$app->request->get();
        $datas = [];
        $requestData = $_REQUEST;
        $modelClass = $this->modelClass;
        $totalAllData = $modelClass::find()->active()->exceptSuperUser();
        if (isset($get['cp']) && $get['cp'] == 'C')
            $totalAllData->andWhere(['care_provider' => '1']);
        $totalData = $totalAllData->count();
        $totalFiltered = $totalData;

        // Order Records
        if (isset($requestData['order'])) {
            if ($requestData['order'][0]['dir'] == 'asc') {
                $sort_dir = SORT_ASC;
            } elseif ($requestData['order'][0]['dir'] == 'desc') {
                $sort_dir = SORT_DESC;
            }
            $order_array = [$requestData['columns'][$requestData['order'][0]['column']]['data'] => $sort_dir];
        }


        if (!empty($requestData['search']['value'])) {
            $filters = [
                'OR',
                    ['like', 'name', $requestData['search']['value']],
                    ['like', 'designation', $requestData['search']['value']],
                    ['like', 'mobile', $requestData['search']['value']],
                    ['like', 'email', $requestData['search']['value']],
            ];
            $total = $modelClass::find()
                    ->active()
                    ->exceptSuperUser();
            if (isset($get['cp']) && $get['cp'] == 'C')
                $total->andWhere(['care_provider' => '1']);
            $totalFiltered = $total->andFilterWhere($filters)
                    ->count();

            $users = $modelClass::find()
                    ->active()
                    ->exceptSuperUser();
            if (isset($get['cp']) && $get['cp'] == 'C')
                $users->andWhere(['care_provider' => '1']);
            $usersall = $users->andFilterWhere($filters)
                    ->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }
        else {
            $users = $modelClass::find()
                    ->active()
                    ->exceptSuperUser();
            if (isset($get['cp']) && $get['cp'] == 'C')
                $users->andWhere(['care_provider' => '1']);
            $usersall = $users->limit($requestData['length'])
                    ->offset($requestData['start'])
                    ->orderBy($order_array)
                    ->all();
        }

        $data = array();
        foreach ($usersall as $user) {
            $data = $user->attributes;
            if (empty($user->login)) {
                $data['login_link_btn'] = 'btn btn-sm btn-info';
                $data['login_link_text'] = 'Create';
                $data['login_link_icon_class'] = 'fa-plus';
                $data['username'] = '-';
                $data['activation_date'] = '-';
                $data['Inactivation_date'] = '-';
            } else {
                $data['login_link_btn'] = 'btn btn-sm btn-primary';
                $data['login_link_text'] = 'Update';
                $data['login_link_icon_class'] = 'fa-pencil';
                $data['username'] = $user->login->username;
                $data['activation_date'] = $user->login->activation_date;
                $data['Inactivation_date'] = $user->login->Inactivation_date;
            }
            //$nestedData = array();
            $data['name'] = $user->name;
            $data['designation'] = $user->designation;
            $data['mobile'] = $user->mobile;
            $data['email'] = $user->email;
            $data['user_id'] = $user->user_id;
            $datas[] = $data;
        }

        $json_data = array(
            "draw" => intval($requestData['draw']),
            "recordsTotal" => intval($totalData),
            "recordsFiltered" => intval($totalFiltered),
            "data" => $datas   // total data array
        );

        echo json_encode($json_data);
    }

    public static function Getuserrolesresources() {
        $user_id = Yii::$app->user->identity->user->user_id;
        $tenant_id = Yii::$app->user->identity->access_tenant_id;

        $role_ids = ArrayHelper::map(CoUsersRoles::find()->where(['user_id' => $user_id])->andWhere(['tenant_id' => $tenant_id])->all(), 'role_id', 'role_id');
        $resource_ids = ArrayHelper::map(CoRolesResources::find()->where(['IN', 'role_id', $role_ids])->andWhere(['tenant_id' => $tenant_id])->all(), 'resource_id', 'resource_id');
        $resources = ArrayHelper::map(CoResources::find()->where(['IN', 'resource_id', $resource_ids])->all(), 'resource_url', 'resource_url');

        //Admin access url
        if (Yii::$app->user->identity->user->tenant_id == 0) {
            $resources['configuration.settings'] = 'configuration.settings';
        }
        return $resources;
    }

    public static function GetuserCredentials($tenant_id) {
        $tenant = CoTenant::findOne(['tenant_id' => $tenant_id]);

        $credentials = [
            'logged_tenant_id' => Yii::$app->user->identity->logged_tenant_id,
            'org' => $tenant->tenant_name,
            'org_address' => $tenant->tenant_address,
            'org_country' => (isset($tenant->coMasterCountry) ? $tenant->coMasterCountry->country_name : '-'),
            'org_state' => (isset($tenant->coMasterState) ? $tenant->coMasterState->state_name : '-'),
            'org_city' => (isset($tenant->coMasterCity) ? $tenant->coMasterCity->city_name : '-'),
            'org_mobile' => $tenant->tenant_mobile,
            'username' => Yii::$app->user->identity->user->name,
            'user_id' => Yii::$app->user->identity->user->user_id,
            'tenant_id' => Yii::$app->user->identity->user->tenant_id,
            'user_timeout' => Yii::$app->user->identity->user_timeout,
        ];
        return $credentials;
    }

    public function actionLogin() {
        $model = new LoginForm();

        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '') && $model->login()) {
            return ['success' => true, 'access_token' => Yii::$app->user->identity->getAuthKey(), 'resources' => self::Getuserrolesresources(), 'credentials' => self::GetuserCredentials(\Yii::$app->request->post('tenant_id'))];
        } elseif (!$model->validate()) {
            return ['success' => false, 'message' => Html::errorSummary([$model])];
        }
    }

    public function actionLogout() {
        if (empty(Yii::$app->user->identity)) {
            return ['success' => true];
        }

        $model = CoLogin::findOne(['login_id' => Yii::$app->user->identity->login_id]);
        if (!empty($model)) {
            $model->attributes = ['authtoken' => '', 'logged_tenant_id' => ''];
            if ($model->save(false))
                return ['success' => true];
            else
                return ['success' => false, 'message' => Html::errorSummary([$model])];
        } else {
            return ['success' => false, 'message' => 'Try again later'];
        }
    }

    public function actionDashboard() {
        $response = [
            'username' => Yii::$app->user->identity->username,
            'access_token' => Yii::$app->user->identity->getAuthKey(),
        ];

        return $response;
    }

    public function actionContact() {

        $model = new ContactForm();
        if ($model->load(Yii::$app->getRequest()->getBodyParams(), '') && $model->validate()) {
            if ($model->sendEmail(Yii::$app->params['adminEmail'])) {
                $response = [
                    'flash' => [
                        'class' => 'success',
                        'message' => 'Thank you for contacting us. We will respond to you as soon as possible.',
                    ]
                ];
            } else {
                $response = [
                    'flash' => [
                        'class' => 'error',
                        'message' => 'There was an error sending email.',
                    ]
                ];
            }
            return $response;
        } else {
            $model->validate();
            return $model;
        }
    }

    public function actionRequestPasswordReset() {
        $model = new PasswordResetRequestForm();
        $model->attributes = Yii::$app->request->post();

        if ($model->validate()) {
            if ($model->sendEmail()) {
                return ['success' => true, 'message' => 'A reset link sent to your email address. Check your mail.'];
            } else {
                return ['success' => false, 'message' => 'Sorry, we are unable to reset password for email & Organization provided.'];
            }
        } else {
            return ['success' => false, 'message' => Html::errorSummary([$model])];
        }
    }

    public function actionCheckResetPassword() {
        $token = Yii::$app->request->post('token');
        if ($token) {
            return $this->checktoken($token);
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionResetPassword() {
        $post = Yii::$app->request->post();
        if ($post) {
            $check_token = $this->checktoken($post['password_reset_token'], true);

            if ($check_token['success']) {
                $model = $check_token['model'];
                $model->attributes = $post;

                if ($model->validate() && $model->resetPassword()) {
                    return ['success' => true, 'message' => 'New password was saved. You will be redirected to Login Page within 10 seconds.'];
                } else {
                    return ['success' => false, 'message' => Html::errorSummary([$model])];
                }
            } else {
                return ['success' => false, 'message' => 'Invalid Access'];
            }
        } else {
            return ['success' => true];
        }
    }

    protected function checktoken($token, $ret_model = false) {
        try {
            $model = new ResetPasswordForm($token);
            if ($ret_model)
                return ['success' => true, 'model' => $model];
            else
                return ['success' => true];
        } catch (InvalidParamException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    public function actionCreateuser() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = new CoUser();
            $model->scenario = 'saveorg';
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

    public function actionUpdateuser() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = CoUser::find()->where(['user_id' => $post['user_id']])->one();
            $model->scenario = 'saveorg';
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

    public function actionGetuser() {
        $id = Yii::$app->request->get('id');

        if (empty($id))
            $id = Yii::$app->user->identity->user->user_id;

        if (!empty($id)) {
            $data = CoUser::find()->where(['user_id' => $id])->one();
            $return = $this->excludeColumns($data->attributes);
            return ['success' => true, 'return' => $return];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetlogin() {
        $id = Yii::$app->request->get('id');
        if (!empty($id)) {
            $user = CoUser::find()->where(['user_id' => $id])->one();

            if (!empty($user)) {
                $data = $user->login;
                $return = empty($data) ? [] : $this->excludeColumns($data->attributes);
                $return['name'] = $user->name;

                return ['success' => true, 'return' => $return];
            } else {
                return ['success' => false, 'message' => 'Invalid Access'];
            }
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionUpdatelogin() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = CoLogin::find()->where(['user_id' => $post['user_id']])->one();

            if (empty($model)) {
                $model = new CoLogin;
                $model->scenario = 'create';
            }

            if (empty($post['password']))
                unset($post['password']);

            $model->attributes = $post;
            if (!empty($model->Inactivation_date)) {
                $model->Inactivation_date = date("Y-m-d", strtotime($model->Inactivation_date));
            }

            $valid = $model->validate();

            if ($valid) {
                if (isset($post['password']))
                    $model->setPassword($model->password);

                $model->save(false);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionGetuserslistbyuser() {
        $list = CoUser::find()->status()->active()->exceptSuperUser()->all();
        return ['userList' => $list];
    }

    public function actionAssignroles() {
        $post = Yii::$app->request->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        if (!empty($post) && !empty($tenant_id)) {
            $model = new CoUsersRoles;
            $model->tenant_id = $tenant_id;
            $model->scenario = 'roleassign';
            $model->attributes = $post;

            if ($model->validate()) {
                $user = CoUser::find()->where(['user_id' => $post['user_id']])->one();

                foreach ($post['role_ids'] as $role_id) {
                    $roles[] = CoRole::find()->where(['role_id' => $role_id])->one();
                }

                $extraColumns = ['tenant_id' => $tenant_id, 'created_by' => Yii::$app->user->identity->user_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()')]; // extra columns to be saved to the many to many table
                $unlink = true; // unlink tags not in the list
                $delete = true; // delete unlinked tags
                $user->linkAll('roles', $roles, $extraColumns, $unlink, $delete);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionAssignbranches() {
        $post = Yii::$app->request->post();
        $tenant_id = Yii::$app->user->identity->logged_tenant_id;

        if (!empty($post) && !empty($tenant_id)) {
            $model = new CoUsersBranches;
            $model->tenant_id = $tenant_id;
            $model->scenario = 'branchassign';
            $model->attributes = $post;

            if ($model->validate()) {
                $user = CoUser::find()->where(['user_id' => $post['user_id']])->one();

                foreach ($post['branch_ids'] as $branch_id) {
                    $branches[] = CoTenant::find()->where(['tenant_id' => $branch_id])->one();
                }

                $extraColumns = ['tenant_id' => $tenant_id, 'created_by' => Yii::$app->user->identity->user_id, 'modified_by' => Yii::$app->user->identity->user_id, 'modified_at' => new Expression('NOW()')]; // extra columns to be saved to the many to many table
                $unlink = true; // unlink tags not in the list
                $delete = true; // delete unlinked tags
                $user->linkAll('branches', $branches, $extraColumns, $unlink, $delete);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionGetmybranches() {
        $id = Yii::$app->request->get('id');
        if (!empty($id)) {
            $branches = CoUsersBranches::find()->andWhere(['user_id' => $id])->all();
            $user_detail = CoUser::find()->where(['user_id' => $id])->one();
            return ['success' => true, 'branches' => $branches, 'default_branch' => $user_detail->tenant_id];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionGetswitchedbrancheslist() {
        $GET = Yii::$app->getRequest()->get();
        $tenant_id = Yii::$app->user->identity->user->tenant_id;
        $org_id = Yii::$app->user->identity->user->org_id;
        if ($tenant_id == 0) {
            $branches = CoTenant::find()
                    ->active()
                    ->status()
                    ->andWhere(['org_id' => $org_id])
                    ->all();
        } else {
            $user_id = Yii::$app->user->identity->user->user_id;
            $branches = CoUsersBranches::find()->joinWith('branch')
                    ->addSelect(['co_tenant.tenant_id as tenant_id', 'co_tenant.tenant_name as tenant_name'])
                    ->andWhere(['user_id' => $user_id])
                    ->andWhere(['or',
                            ['status' => '1'],
                            ['status' => '']
                    ])
                    ->all();
        }

        if (isset($GET['map'])) {
            $map = explode(',', $GET['map']);
            $branches = ArrayHelper::map($branches, $map[0], $map[1]);
        }

        return ['success' => true, 'branches' => $branches, 'default_branch' => strval(Yii::$app->user->identity->logged_tenant_id),
            'org_logo' => \yii\helpers\Url::to("@web/images/organization_logo/" . Yii::$app->user->identity->user->organization->org_logo . "", true),
            'org_small_logo' => \yii\helpers\Url::to("@web/images/organization_logo/" . Yii::$app->user->identity->user->organization->org_small_logo . "", true),
            'org_document_logo' => \yii\helpers\Url::to("@web/images/organization_logo/" . Yii::$app->user->identity->user->organization->org_document_logo . "", true)];
    }

    public function actionGetdoctorslist() {
        $tenant = null;
        $status = '1';
        $deleted = false;
        $care_provider = '1';

        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['care_provider']))
            $care_provider = $get['care_provider'];

        return ['doctorsList' => CoUser::getDoctorsList($tenant, $care_provider, $status, $deleted)];
    }

    public function actionGetdoctorslistforpatient() {
        $tenant = null;
        $status = '1';
        $deleted = false;
        $care_provider = '1';

        $get = Yii::$app->getRequest()->get();

        if (isset($get['tenant']))
            $tenant = $get['tenant'];

        if (isset($get['status']))
            $status = strval($get['status']);

        if (isset($get['deleted']))
            $deleted = $get['deleted'] == 'true';

        if (isset($get['care_provider']))
            $care_provider = $get['care_provider'];

        $doctors = CoUser::getDoctorsList($tenant, $care_provider, $status, $deleted);

        $patient = \common\models\PatPatient::getPatientByGuid($get['patient_guid']);
        if (isset($patient->patActiveOPEncounters)) {
            $exist_doc = [];

            foreach ($patient->patActiveOPEncounters as $op_enc) {
                $exist_doc[] = $op_enc->patLiveAppointmentBooking->consultant_id;
            }

            foreach ($doctors as $key => $doctor) {
                if (in_array($doctor->user_id, $exist_doc)) {
                    unset($doctors[$key]);
                }
            }
        }

        return ['doctorsList' => array_values($doctors)];
    }

    protected function excludeColumns($attrs) {
        $exclude_cols = ['created_by', 'created_at', 'modified_by', 'modified_at'];
        foreach ($attrs as $col => $val) {
            if (in_array($col, $exclude_cols))
                unset($attrs[$col]);
        }
        return $attrs;
    }

    public function actionCheckstateaccess() {
        $stateName = Yii::$app->request->post('stateName');
        if ($stateName) {
            return $this->checkstate($stateName);
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    protected function checkstate($stateName) {
        $module = CoResources::find()->where(["resource_url" => $stateName])->one();
        $resource_id = $module->resource_id;

        $tenant_id = Yii::$app->user->identity->logged_tenant_id;
        $user_id = Yii::$app->user->identity->user->user_id;

        $role_ids = CoUsersRoles::find()->select(['GROUP_CONCAT(role_id) AS role_ids'])->where(['tenant_id' => $tenant_id, 'user_id' => $user_id])->one();
        $role_ids = explode(',', $role_ids->role_ids);

        $have_access = CoRolesResources::find()->tenant()->andWhere(['IN', 'role_id', $role_ids])->andWhere(["resource_id" => $resource_id])->one();

        if (!empty($have_access))
            return ['success' => true];
        else
            return ['success' => false, 'message' => 'Invalid access'];
    }

    public function actionGetusercredentialsbytoken() {
        $token = Yii::$app->request->post('token');
        if (!empty($token)) {
            $data = CoLogin::find()->where(['authtoken' => $token])->one();

            $credentials = [
                'org' => $data->user->tenant->tenant_name
            ];
            return ['success' => true, 'credentials' => $credentials];
        } else {
            return ['success' => false, 'message' => 'Invalid Access'];
        }
    }

    public function actionPasswordauth() {
        $post = Yii::$app->request->post();

        if (!isset($post['verify_password']) || empty($post['verify_password'])) {
            return ['success' => false, 'message' => 'Please enter password'];
        }

        $check = Yii::$app->security->validatePassword($post['verify_password'], Yii::$app->user->identity->password);

        if ($check) {
            $encounter = PatEncounter::find()->where(['encounter_id' => $post['encounter_id']])->one();

            $column = $post['column'];
            $value = $post['value'];

            if ($value || $column == 'discharge') {
                $encounter->$column = Yii::$app->user->identity->user_id;

                if ($column == 'discharge')
                    $encounter->status = 0;

                if ($column == 'finalize')
                    $encounter->finalize_date = date("Y-m-d");
            }else {
                $encounter->$column = 0;
                if ($column == 'finalize') {
                    //Un Finalize date is greater than finalize date - Add recurrings 
                    if (date("Y-m-d") > $encounter->finalize_date) {
                        Yii::$app->hepler->addRecurring($encounter->patCurrentAdmissionExecptClinicalDischarge);
                    }
                    $encounter->finalize_date = "0000-00-00";
                }
            }

            $encounter->save(false);

            $this->_insertTimeline($encounter, $column, $value);
            return ['success' => true, 'encounter' => $encounter];
        } else {
            return ['success' => false, 'message' => 'Password is not valid'];
        }
    }

    private function _insertTimeline($encounter, $column, $value) {
        $header_sub = "Encounter # {$encounter->encounter_id}";

        $full_name = Yii::$app->user->identity->user->title_code . ' ' . Yii::$app->user->identity->user->name;

        switch ($column) {
            case 'finalize':
                if ($value > 0) {
                    $header = "Bill Finalize";
                    $message = "Bill Finalized By " . $full_name;
                    $activity = "Bill Finalized Successfully(#$encounter->encounter_id)";
                } else {
                    $header = "Bill Un Finalize";
                    $message = "Bill Un Finalized By " . $full_name;
                    $activity = "Bill Un Finalized Successfully(#$encounter->encounter_id)";
                }
                break;
            case 'authorize':
                if ($value > 0) {
                    $header = "Bill Authorize";
                    $message = "Bill Authorize By " . $full_name;
                    $activity = "Bill Authorize Successfully(#$encounter->encounter_id)";
                } else {
                    $header = "Bill Un Authorize";
                    $message = "Bill Un Authorize By " . $full_name;
                    $activity = "Bill Un Authorize Successfully(#$encounter->encounter_id)";
                }
                break;
            case 'discharge':
                if ($value > 0) {
                    $header = "Administrative Discharge";
                    $message = "Administrative Discharge By " . $full_name;
                    $activity = "Administrative Discharge Successfully(#$encounter->encounter_id)";
                } else {
                    $header = "Administrative Discharge Cancel";
                    $message = "Administrative Discharge Cancel By " . $full_name;
                    $activity = "Administrative Discharge Cancel Successfully(#$encounter->encounter_id)";
                }
                break;
        }
        $date_time = date("Y-m-d H:i:s");
        PatTimeline::insertTimeLine($encounter->patient_id, $date_time, $header, $header_sub, $message, 'BILLING', $encounter->encounter_id);
        CoAuditLog::insertAuditLog(PatEncounter::tableName(), $encounter->encounter_id, $activity);
    }

    public function actionChangepassword() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = CoLogin::find()->where(['login_id' => Yii::$app->user->identity->login_id])->one();
            $model->scenario = 'change_password';
            $model->attributes = $post;

            $valid = $model->validate();

            if ($valid) {
                $model->setPassword($post['new_password']);
                $model->save(false);
                return ['success' => true];
            } else {
                return ['success' => false, 'message' => Html::errorSummary([$model])];
            }
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

    public function actionGetdoctor() {
        $post = Yii::$app->getRequest()->post();
        $doctors = [];
        $limit = 10;
        $only = Yii::$app->request->get('only');

        if (isset($post['search']) && !empty($post['search']) && strlen($post['search']) >= 2) {
            $text = $post['search'];
            //$tenant_id = Yii::$app->user->identity->logged_tenant_id;

            $lists = CoUser::find()
                    ->andWhere([
                        'co_user.deleted_at' => '0000-00-00 00:00:00',
                        'co_user.status' => '1',
                        'co_user.care_provider' => '1',
                    ])
                    ->andFilterWhere([
                        'or',
                            ['like', 'co_user.name', $text],
                    ])
                    ->limit($limit)
                    ->all();

            if ($only == 'doctors') {
                return ['doctors' => $lists];
            }

//            foreach ($lists as $key => $doctor) {
//                $doctors[$key]['Doctor'] = $doctor;
//            }
        }
        return ['doctors' => $doctors];
    }

    public function actionChangeusertimeout() {
        $post = Yii::$app->request->post();
        if (!empty($post)) {
            $model = CoLogin::find()->where(['login_id' => Yii::$app->user->identity->login_id])->one();
            $model->user_timeout = $post['user_session_timeout'];
            $model->save(false);
            return ['success' => true, 'memory' => ini_get('memory_limit')];
        } else {
            return ['success' => false, 'message' => 'Please Fill the Form'];
        }
    }

}
