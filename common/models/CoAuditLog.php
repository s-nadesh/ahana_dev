<?php

namespace common\models;

use common\models\query\CoAuditLogQuery;
use Yii;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "co_audit_log".
 *
 * @property integer $audit_log_id
 * @property integer $tenant_id
 * @property integer $user_id
 * @property string $action
 * @property string $activity
 * @property string $ip_address
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 */
class CoAuditLog extends RActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'co_audit_log';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
                [['tenant_id', 'user_id', 'action', 'activity', 'ip_address', 'status', 'created_by'], 'required'],
                [['tenant_id', 'user_id', 'created_by', 'modified_by'], 'integer'],
                [['status'], 'string'],
                [['created_at', 'modified_at', 'deleted_at', 'table_name', 'table_pk'], 'safe'],
                [['action', 'activity', 'ip_address'], 'string', 'max' => 250],
                [['tenant_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoTenant::className(), 'targetAttribute' => ['tenant_id' => 'tenant_id']],
                [['user_id'], 'exist', 'skipOnError' => true, 'targetClass' => CoUser::className(), 'targetAttribute' => ['user_id' => 'user_id']],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'audit_log_id' => 'Audit Log ID',
            'tenant_id' => 'Tenant ID',
            'user_id' => 'User ID',
            'action' => 'Action',
            'activity' => 'Activity',
            'ip_address' => 'Ip Address',
            'table_name' => 'Table Name',
            'table_pk' => 'Table Pk',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant() {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }

    public function getUser() {
        return $this->hasOne(CoUser::className(), ['user_id' => 'user_id']);
    }

    public static function find() {
        return new CoAuditLogQuery(get_called_class());
    }

    public function fields() {
        $extend = [
            'tenant' => function ($model) {
                return (isset($model->tenant) ? $model->tenant->tenant_name : '-');
            },
            'user' => function ($model) {
                return (isset($model->user) ? $model->user->fullname : '-');
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }

    public static function insertAuditLog($table_name, $table_pk, $activity, $tenant = null, $user = null, $action = null) {
        $model = new CoAuditLog;
        $model->attributes = [
            'tenant_id' => isset(Yii::$app->user->identity->logged_tenant_id) ? Yii::$app->user->identity->logged_tenant_id : $tenant,
            'user_id' => isset(Yii::$app->user->identity->user_id) ? Yii::$app->user->identity->user_id : $user,
            'table_name' => $table_name,
            'table_pk' => $table_pk,
            'action' => isset($_SERVER['HTTP_CONFIG_ROUTE']) ? $_SERVER['HTTP_CONFIG_ROUTE'] : $action,
            'activity' => $activity,
            'ip_address' => Yii::$app->getRequest()->getUserIP(),
        ];
        $model->save(false);
    }

}
